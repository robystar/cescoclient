//viene usato come mixins nel controller Map , espone la funzione search che, passato un form, fa le operazioni di ricerca e visualizza il risultato su mappa e nei dati
Ext.define('Map.Search', {
    loadingWindow: null,
    
    statics: {
        requestStatus: {
            PREPARED: 1,
            COUNTING: 2,
            COUNTED: 3,
            COUNT_ERROR: 4,
            STARTED: 5,
            ENDED: 6,
            ERROR: 7
        }
    },
    
    wfsRequests: [],
    runningRequests: [],
    requestOptions: null,
    resultsComponents: [],
    
    wfsQuery: function(queries, options) {
        var me = this,
            xmlFormat = new OpenLayers.Format.XML(),
            filterFormat = new OpenLayers.Format.Filter(),
            len = queries.length,
            filters, filter, value, query, criterion, index, wfsService;

        me.resetResults();
        
        me.handleStartQuery();
        
        me.getSearchResultsLayer().removeAllFeatures();
        
        me.requestOptions = options;
        
        for(var i = 0; i < len; i++) {
            query = queries[i];
            
            for(var j = 0; j < query.criteria.length; j++) {
                criterion = query.criteria[i];

                index = me.wfsServices.find('typeName', query.typeName);
                wfsService = me.wfsServices.getAt(index);
                filters = [];
                
                switch(criterion.type) {
                    case 'comparison':
                        value = criterion.value;
                        if(criterion.operator == 'LIKE') value = '*'+value+'*';
                        filters.push(new OpenLayers.Filter.Comparison({
                            property: criterion.property,
                            type: OpenLayers.Filter.Comparison[criterion.operator || 'EQUAL_TO'],
                            value: value
                        }));
                    break;
                    case 'spatial':
                        filters.push(new OpenLayers.Filter.Spatial({
                            property: criterion.property || 'the_geom', //TODO
                            type: OpenLayers.Filter.Spatial[criterion.operator || 'INTERSECTS'],
                            value: criterion.value
                        }));
                    break;
                }
            }
            
            if(filters.length > 1) {
                filter = xmlFormat.write(filterFormat.write(new OpenLayers.Filter.Logical({
                    type: OpenLayers.Filter.Logical.AND,
                    filters: filters
                })));
            } else if(filters.length == 1) {
                filter = xmlFormat.write(filterFormat.write(filters[0]));
            }
            
            filter = filter.replace('<ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">', '<ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!" matchCase="false">');
            filter = filter.replace('<ogc:PropertyIsLike wildCard="*" singleChar="." escape="!">', '<ogc:PropertyIsLike wildCard="*" singleChar="." escape="!" matchCase="false">');
            
            me.wfsRequests.push({
                wfsService: wfsService,
                filter: filter,
                count: null,
                status: Map.Search.requestStatus.PREPARED,
                response: null
            });
        }
        me.startCountRequests();
    },
    
    startCountRequests: function() {
        var me = this,
            len = me.wfsRequests.length,
            wfsRequest;
            
        for(var i = 0; i < len; i++) {
            wfsRequest = me.wfsRequests[i];
            
            wfsRequest.status = Map.Search.requestStatus.COUNTING;
            me.runningRequests.push(Ext.Ajax.request({
                wfsRequest: wfsRequest,
                url: wfsRequest.wfsService.get('url'),
                params: {
                    service: 'WFS',
                    request: 'GetFeature',
                    version: '1.1.0',
                    typeName: wfsRequest.wfsService.get('typeName'),
                    srs: me.getSRID(),
                    filter: wfsRequest.filter,
                    resultType: 'HITS'
                },
                callback: function(request, success, response) {
                    if(!success) {
                        request.wfsRequest.status = Map.Search.requestStatus.COUNT_ERROR
                        console.log(request);
                        return;
                    }
                    if(!response.responseXML || !response.responseXML.firstChild ||
                        !response.responseXML.firstChild.getAttribute('numberOfFeatures')) {
                        console.log(response);
                        request.wfsRequest.status = Map.Search.requestStatus.COUNT_ERROR
                        return;
                    }                    
                    var count = response.responseXML.firstChild.getAttribute('numberOfFeatures'),
                        len = me.wfsRequests.length,
                        isCounting = false,
                        countRequest;
                    
                    request.wfsRequest.status = Map.Search.requestStatus.COUNTED;
                    request.wfsRequest.count = count;
                    
                    for(var i = 0; i < len; i++) {
                        countRequest = me.wfsRequests[i];
                        
                        if(countRequest.status == Map.Search.requestStatus.COUNTING) {
                            isCounting = true;
                        }
                    }
                    
                    if(!isCounting) {
                        me.handleCountFinished();
                    }
                }
            }));
        }
    },
    
    handleCountFinished: function() {
        var me = this,
            len = me.wfsRequests.length,
            total = 0,
            errors = [],
            wfsRequest;
            
        for(var i = 0; i < len; i++) {
            wfsRequest = me.wfsRequests[i];
            
            if(wfsRequest.status == Map.Search.requestStatus.COUNT_ERROR) {
                errors.push(wfsRequest.wfsService.text);
            } else {
                total += wfsRequest.count;
            }
        }
        if(errors.length > 0) {
            var widthMapWindow = me.mapWindow.getWidth();
            var heightMapWindow = me.mapWindow.getHeight();
            
            Ext.create('Ext.window.Window', {
                title: _('Errori nel conteggio'),
                icon: 'resources/images/silkicons/error.png',
                x: widthMapWindow-300,
                y: heightMapWindow-110,
                width: 300,
                html: '<p style="padding: 10px; font-weight: bold;">'+_('Il conteggio dei risultati dei layers seguenti non è andato a buon fine')+':<br><span style="color: #bd362d;">'+errors.join(', ')+'</span></p>'
            }).show();
        }
        
        if(total > 100) {
            Ext.MessageBox.confirm(_('Conferma'), _('La richiesta ha generato ${count} risultati. La visualizzazione di questi risultati potrebbe richiedere diversi minuti e potrebbe rallentare il browser. Continuare?'), function(btn, event){
                if(btn == 'yes'){
                    me.startRequests();
                } else return false;
            });
        } else {
            me.startRequests();
        }
    },
    
    startRequests: function() {
        var me = this,
            len = me.wfsRequests.length,
            wfsRequest;
            
        for(var i = 0; i < len; i++) {
            wfsRequest = me.wfsRequests[i];
            
            wfsRequest.status = Map.Search.requestStatus.STARTED;
            me.runningRequests.push(Ext.Ajax.request({
                wfsRequest: wfsRequest,
                url: wfsRequest.wfsService.get('url'),
                params: {
                    service: 'WFS',
                    request: 'GetFeature',
                    version: '1.1.0',
                    typeName: wfsRequest.wfsService.get('typeName'),
                    srs: me.getSRID(),
                    filter: wfsRequest.filter
                },
                callback: function(request, success, response) {
                    if(!success) {
                        request.wfsRequest.status = Map.Search.requestStatus.ERROR;
                        return;
                    }
                    var len = me.wfsRequests.length,
                        isRequesting = false,
                        wfsRequest;
                    
                    request.wfsRequest.status = Map.Search.requestStatus.ENDED;
                    request.wfsRequest.response = response;
                    
                    for(var i = 0; i < len; i++) {
                        wfsRequest = me.wfsRequests[i];
                        if(wfsRequest.status == Map.Search.requestStatus.STARTED) {
                            isRequesting = true;
                        }
                    }
                    
                    if(!isRequesting) {
                        me.handleResponses();
                    }
                }
            }));
        }
    },
    
    handleResponses: function() {
        var me = this,
            defaultOptions = {
                afterSelectionAction: 'none'
            },
            options = Ext.apply(defaultOptions, me.requestOptions),
            format = new OpenLayers.Format.GML(),
            len = me.wfsRequests.length,
            errors = [],
            features, config, store, grid;

        for(var i = 0; i < len; i++) {
            wfsRequest = me.wfsRequests[i];

            if(!wfsRequest.response || (!wfsRequest.response.responseXML && !wfsRequest.response.responseText) ||
                wfsRequest.status == Map.Search.requestStatus.ERROR) {
                errors.push(wfsRequest.wfsService.text);
                continue;
            }
            
            try {
                features = format.read(wfsRequest.response.responseXML || wfsRequest.response.responseText);
            } catch(e) {
                errors.push(wfsRequest.wfsService.text);
                continue;
            }
            
            config = me.getGridConfig(wfsRequest.wfsService);
            me.getSearchResultsLayer().addFeatures(features);
            
            store = Ext.create('GeoExt.data.FeatureStore', {
                layer: me.getSearchResultsLayer(),
                fields: config.fields
            });

            grid = Ext.create('Map.view.QueryResult', {
                title: config.title,
                autoScroll: true,
                columns: config.columns,
                store: store,
                selType: 'featuremodel'
            });
            
            me.showComponent(grid);
            me.resultsComponents.push(grid);
        }

        if(options.afterSelectionAction != 'none') {
            var bounds = me.getSearchResultsLayer().getDataExtent()
            if(options.afterSelectionAction == 'zoom') {
                me.map.zoomToExtent(bounds.scale(1.2));
            } else if(options.afterSelectionAction == 'center') {
                me.map.setCenter(bounds.getCenterLonLat());
            }
        }
        if(errors.length > 0) {
            var widthMapWindow = me.mapWindow.getWidth();
            var heightMapWindow = me.mapWindow.getHeight();
            
            Ext.create('Ext.window.Window', {
                title: 'Errori nel conteggio',
                icon: 'resources/images/silkicons/error.png',
                x: widthMapWindow-300,
                y: heightMapWindow-110,
                width: 300,
                html: '<p style="padding: 10px; font-weight: bold;">'+_('Il conteggio dei risultati dei layers seguenti non è andato a buon fine')+':<br><span style="color: #bd362d;">'+errors.join(', ')+'</span></p>'
            }).show();
            console.log(errors);
        }
        
        me.handleEndQuery();
    },
    
    
    handleStartQuery: function() {
        var me = this;
        var button = me.mapWindow.down('button[r3action="searchbutton"]');
        button.setDisabled(true);
        button.setText(_('Caricamento...'));
        //Ext.get('loading-map').show();
        me.showLoading();
    },
    handleEndQuery: function() {
        var me = this;
        var button = me.mapWindow.down('button[r3action="searchbutton"]');
        button.setDisabled(false);
        button.setText(_('Cerca'));
        //Ext.get('loading-map').remove();
        me.hideLoading();
    },
    
    getSearchResultsLayer: function() {
        if(!this.map) this.initMap();
        if(!this.searchResultsLayer) {
            this.searchResultsLayer = new OpenLayers.Layer.Vector('Search Results layer');
            this.map.addLayer(this.searchResultsLayer);
        }
        return this.searchResultsLayer;
    },
    
    getGridConfig: function(wfsService) {
        var me = this,
            fields = [],
            columns = [],
            config = {},
            len = wfsService.get('properties').length;
        
        for(var i = 0; i < len; i++) {
            property = wfsService.get('properties')[i];
            columns.push({
                dataIndex: property.fieldName,
                text: property.fieldTitle
            });
            fields.push({
                type: property.fieldType,
                name: property.fieldName
            });
        }
        
        config = {
            fields: fields,
            columns: columns,
            title: wfsService.get('text')
        };
        return config
    },
    
    resetResults: function() {
        var me = this;
        
        for(var i = 0; i < me.runningRequests.length; i++) {
            Ext.Ajax.abort(me.runningRequests[i]);
        }
        
        me.wfsRequests = [];
        
        for(var i = 0; i < me.resultsComponents.length; i++) {
            me.removeComponent(me.resultsComponents[i]);
        }
    },
    
    showLoading: function() {
        if(!this.loadingWindow) {
            this.loadingWindow = new Ext.LoadMask(this.mapWindow, {msg:_('Prego attendere...')});
        }
        this.loadingWindow.show();
    },
    
    hideLoading: function() {
        this.loadingWindow.hide();
    }
    
});