/**
 * R3Base map Controller. Controller base di mappa
 * Viene esteso negli applicativi
 * 
 *
 * @docauthor FD
 */

Ext.define('R3Base.map.Controller', {
    extend: 'Ext.app.Controller',
    
    mixins: ['Map.Search'],
    
    requires: ['GeoExt.container.WmsLegend', 'GeoExt.container.VectorLegend', 'GeoExt.container.UrlLegend', 'GeoExt.tree.Panel', 'GeoExt.tree.LayerNode', 'GeoExt.data.LayerTreeModel', 'Map.plugins.LayerGroup', 'Map.view.MapPanel', 'Map.Toolbar', 'Map.view.Sidebar', 'Map.LayerTreeModel', 'Map.tool.Selection', 'Map.view.LayerOption', 'GeoExt.selection.FeatureModel'],
    
    mapConfigUrl: undefined, // required
    
    toggleGroup: 'navigation',
    
    layerTreeStore: null, //store per i layer del tree
    searchStore: null, //store per il tab ricerca
    mapConfig: null,
    tools: [],
    
    editingRecord: null, //record nella fase di edit della geometria
    
    //funzione che viene chiamata per mostrare la mappa [DOC]
    /**
     * Apre la mappa
     * 
     * @protected
    */
    showMap: function() {
        var me = this;
        R3Base.Util.showLoading();
        Ext.Function.defer(function(){
            me.getMapWindow().show();
            R3Base.Util.hideLoading();
        }, 10);
    },
    
    
    //funzione che viene chiamata per zoommare su un record [DOC]
    /**
     * Utilizzata per zoommare su un {@link Ext.data.Model record}
     * 
     * @param {Ext.data.Model} record Il record
     * @protected
    */
    zoomTo: function(record, options) {
        var me = this,
            defaultOptions = {showGeometry: true},
            options = options ? Ext.Object.merge(defaultOptions, options) : defaultOptions,
            hasGeometry = record.hasGeometry();
            
        if(!hasGeometry) return; //se apro prima un record con geomeria e poi uno senza, si ricorda della geomteria precedente
        var geometry = record.getGeometry();
        var bounds = geometry.getBounds().scale(1.2);
            
        if(options.showGeometry) {
            var feature = new OpenLayers.Feature.Vector(record.getGeometry(), record.getData());
            
            me.getHighlightLayer().removeAllFeatures();
            me.getHighlightLayer().addFeatures([feature]);
        }
            
        R3Base.Util.showLoading();
        Ext.Function.defer(function(){
            me.getMapWindow().show();
            
            var zoom = me.map.getZoomForExtent(bounds);
            if(me.minZoomLevel && zoom > me.minZoomLevel) {
                me.map.setCenter(bounds.getCenterLonLat(), me.minZoomLevel);
            } else {
                me.map.zoomToExtent(bounds);
            }
            
            R3Base.Util.hideLoading();
        }, 10);
    },
    
    init: function() {
        var me = this;

        Ext.Ajax.request({
            url: me.mapConfigUrl,
            params: {
                extjs: 2
            },
            success: function(response) {
                me.mapConfig = Ext.JSON.decode(response.responseText);
            }
        });
    },
    
    //template function per aggiungere tools [DOC]
    initTools: function() {
        var me = this;
        
        if(me.wfsServices.getCount() > 0) {
            me.selection = Ext.widget('mapselection', {
                map: me.map,
                wfsServices: me.wfsServices,
                tooltip: 'Seleziona',
                iconCls: 'silk-selection',
                toggleGroup: me.toggleGroup
            });
            me.tools.push(me.selection);
        }
    },
    
    
    getMapWindow: function() {
        if(this.mapWindow) return this.mapWindow;
        
        var me = this,
            actions = {},
            windowWidth = (Ext.getBody().getWidth()-200),
            windowHeight = (Ext.getBody().getHeight()-100);
            
        me.initMap();
        me.initTools();

        mapPanel = Ext.widget('mappanel', {
            map: me.map,
            projectionDescription: me.mapConfig.projectionDescription,
            dockedItems: [{
                xtype: 'maptoolbar',
                map: me.map,
                dock: 'top',
                tools: me.tools
            }],
            geolocator: {
                xtype: 'streetcombobox',
                labelAlign: 'right',
                labelWidth: 'auto',
                style: {
                    marginLeft: '5px' 
                },
                listeners: {
                    'select': function(combobox, records) {
                        me.zoomTo(records[0], {showGeometry: false});
                    }
                }
            }
        });

        // se la risoluzione è bassa, allarga la finestra di mappa
        if(Ext.getBody().getWidth()<1100){
            windowWidth = Ext.getBody().getWidth()-20;
        }
        
        if(Ext.getBody().getHeight()<800){
            windowHeight = Ext.getBody().getHeight()-50;
        }
        
        me.mapWindow = me.application.createContainer({
            title: _('Mappa'),
            x: 15,
            y: 20,
            autoScroll: false,
            closeAction: 'hide',
            maximizable: true,
            layout: 'border',
            height: windowHeight,
            width: windowWidth,
            maxWidth: undefined,
            items: [
                mapPanel,
                {
                    xtype: 'mapsidebar',
                    map: me.map,
                    layerTreeStore: me.layerTreeStore,
                    searchStore: me.searchStore
                }
            ]
        });

        // attivare il tool pan
        
        me.initMapControllers();
        
        return me.mapWindow;
    },
    
    manageLayerOptions: function() {
        console.log(arguments);
        //console.log(arguments[8].getXY());
        //console.log(arguments[6].getXY());
        //console.log(arguments[7].getXY());
        var mousePositionY = window.event.clientY; //A Gloria: secondo me questi dati sono in uno degli argomenti di questa funzione. A Francesco: non credo ci siano, ho fatto alcuni console.log
        var mousePositionX = window.event.clientX;

        Ext.WindowManager.each(function(window) {
            if(window.r3role && window.r3role == 'layeroptions') window.close();
        });
        
        Ext.create('Ext.window.Window', {
            title: _('Opzioni'),
            constrain: true,
            width:300,
            x: mousePositionX-300,
            y: mousePositionY,
            bodyPadding: 10,
            r3role: 'layeroptions',
            items: [{xtype: 'layeroptions'}],
            buttons: [
                {text: _('Applica')}
            ]
        }).show();
    },
    
    initMapControllers: function() {
        var me = this;
        
        if(me.searchStore) {
            me.control('mapsearchform', {
                'search': function(queries, options) {
                    me.wfsQuery(queries, options);
                }
            });
        }
        if(me.wfsServices) {
            me.control('mapselection', {
                'query': function(queries, options) {
                    me.wfsQuery(queries, options);
                }
            });
        }
        
        me.control({ //spostare...
            'layertree [r3action="layeropacity"]': {
                click: me.manageLayerOptions
            }
        });
    },
    

    getSRID: function() {
        return this.mapConfig.projection;
    },
    
    getHighlightLayer: function() {
        if(!this.highlightLayer) {
            this.highlightLayer = new OpenLayers.Layer.Vector('Highlight layer');
            this.map.addLayer(this.highlightLayer);
        }
        return this.highlightLayer;
    },
    
    getScaleStore: function() {
        if(!this.scaleStore) {
            this.scaleStore = Ext.create('GeoExt.data.ScaleStore', {
                map: this.map
            });
            //strano.. le scale vengono non tonde. Come se mancassero due cifre alla risoluzione
            this.scaleStore.each(function(record) {
                record.set('scale', Math.round(record.get('scale')));
            });
        }
        return this.scaleStore;
    },
    
    initMap: function() {
        var me = this,
            defaultMapOptions = {
                units: 'm',
                fractionalZoom: true,
                controls: [
                    new OpenLayers.Control.PanZoomBar({
                        forceFixedZoomLevel:true,
                        isPermanent:true
                    }),
                    new OpenLayers.Control.Attribution(),
                    new OpenLayers.Control.ScaleLine(),
                    new OpenLayers.Control.TouchNavigation(),
                    new OpenLayers.Control.Navigation()
                ]
            },
            mapOptions = {}, olLayers = [], layers = {},
            baseLayer, node, theme, layerConfig, layer, treeConfig, search, isVisible;
        
        Ext.apply(mapOptions, me.mapConfig.mapOptions, defaultMapOptions);
        //create ol map
        me.map = new OpenLayers.Map(mapOptions);
        
        // baselayer finto
        baseLayer = new OpenLayers.Layer.Image('BASE_LAYER',
            OpenLayers.ImgPath +'blank.gif',
            OpenLayers.Bounds.fromArray(mapOptions.maxExtent),
            new OpenLayers.Size(1,1),
            {
                isBaseLayer: true,
                resolutions: mapOptions.resolutions,
                displayInLayerSwitcher: false
            }
        );
        me.map.addLayer(baseLayer);
        
        // creazione layers
        //TODO: accettare anche TMS
        for(var i = 0; i < me.mapConfig.wmsServices.length; i++) {
            layer = me.mapConfig.wmsServices[i];
            layers[layer.name] = new OpenLayers.Layer.WMS(
                layer.title,
                layer.url,
                layer.parameters,
                layer.options
            );
        }
        
        //configurazione layer tree
        treeConfig = {
            text: '-',
            children: []
        };
        for(var i = 0; i < me.mapConfig.nodes.length; i++) {
            node = me.mapConfig.nodes[i];
            theme = {
                text: node.text,
                plugins: ['layergroup'],
                name: node.name,
                children: []
            };
            for(var j = 0; j < node.children.length; j++) {
                layer = node.children[j];
                isVisible = !(typeof(layer.displayInLayerSwitcher) != 'undefined' && layer.displayInLayerSwitcher == false);
                if(isVisible) {
                    theme.children.push({
                        plugins: ['gx_layer'],
                        layer: layers[layer.name],
                        text: layers[layer.name].name
                    });
                }
                olLayers.push(layers[layer.name]);
            }
            if(theme.children.length > 0) {
                treeConfig.children.push(theme);
            }
        }

        me.layerTreeStore = Ext.create('Ext.data.TreeStore', {
            model: 'Map.LayerTreeModel',
            root: treeConfig
        });

        olLayers.reverse();
        for(var i = 0; i < olLayers.length; i++) {
            me.map.addLayer(olLayers[i]);
        }
        
        if(me.minZoomScale) {
            var scaleIndex = me.getScaleStore().find('scale', me.minZoomScale);
            me.minZoomLevel = me.getScaleStore().getAt(scaleIndex).get('level');
        }
        
        if(me.mapConfig.wfsServices && me.mapConfig.wfsServices) {
            me.wfsServices = Ext.create('Ext.data.Store', {
                fields: [
                    'typeName',
                    'WMSLayerName',
                    'geometryType',
                    'text',
                    'properties',
                    'url'
                ],
                data: me.mapConfig.wfsServices
            });
        }
        
        
        if(me.mapConfig.searches && me.mapConfig.searches.length > 0) {
            me.searchStore = Ext.create('Ext.data.Store', {
                fields: [
                    'text',
                    'type',
                    'searchfields',
                    'name',
                    'url',
                    'storeConfig'
                ],
                data: me.mapConfig.searches
            });
        }
    },

    showComponent: function(component) {
        var me = this,
            target = me.mapWindow.down('mapsidebar').down('tabpanel');
        
        var lastItem = target.add({
            xtype: 'panel',
            height: '100%',
            items: component,
            autoScroll: true,
            title: _('Dati')
        });
        
        target.setActiveTab(lastItem);
    },
    
    removeComponent: function(component) {
        var me = this,
            target = component.ownerCt;
        
        target.remove(component, true);
        
        if(target.items.length == 0) {
            target.ownerCt.remove(target, true);
        }
    }
    
});