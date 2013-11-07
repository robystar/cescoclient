Ext.define('Map.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    region: 'north',
    
    alias: 'widget.maptoolbar',
    
    requires: ["GeoExt.data.ScaleStore", 'Map.tool.MeasureLength', 'Map.tool.MeasureArea', 'Map.view.SelectionToolbar', 'Map.tool.MapPrint'],
    
    actions: {},
    
    //config di pulsanti aggiuntivi
    tools: [],
    
    toggleGroup: 'navigation',
    
    initComponent: function() {
        var me = this,
            tool, items;
        
        me.actions.ZoomToMaxExtent = Ext.create('GeoExt.Action', {
            map: me.map,
            iconCls: 'silk-arrow_out',
            tooltip: _('Massima estensione'),
            control: new OpenLayers.Control.ZoomToMaxExtent()
        });
        var ZoomToMaxExtent = Ext.create('Ext.button.Button', me.actions.ZoomToMaxExtent);
        
        var navigationHistory = new OpenLayers.Control.NavigationHistory();
        me.actions.zoomPrev = Ext.create('GeoExt.Action', {
            tooltip: _('Vista precedente'),
            control: navigationHistory.previous,
            iconCls: 'silk-arrow_prev'
        });
        var zoomPrev = Ext.create('Ext.button.Button', me.actions.zoomPrev);
        
        me.actions.zoomNext = Ext.create('GeoExt.Action', {
            tooltip: _('Vista sucessiva'),
            control: navigationHistory.next,
            iconCls: 'silk-arrow_next'
        });
        var zoomNext = Ext.create('Ext.button.Button', me.actions.zoomNext);
        
        me.actions.dragPan = Ext.create('GeoExt.Action', {
            tooltip: _('Pan'),
            control: new OpenLayers.Control.DragPan(),
            map: me.map,
            iconCls: 'silk-pan',
            toggleGroup: me.toggleGroup,
            activateOnEnable: true,
            deactivateOnEnable: true
        });
        var dragPan = Ext.create('Ext.button.Button', me.actions.dragPan);
        
        me.actions.zoomIn = Ext.create('GeoExt.Action', {
            tooltip: _('Ingrandisci'),
            control: new OpenLayers.Control.ZoomBox(),
            map: me.map,
            iconCls: 'silk-magnifier_zoom_in',
            toggleGroup: me.toggleGroup,
            activateOnEnable: true,
            deactivateOnEnable: true
        });
        var zoomIn = Ext.create('Ext.button.Button', me.actions.zoomIn);
        
        me.actions.zoomOut = Ext.create('GeoExt.Action', {
            tooltip: _('Riduci'),
            control: new OpenLayers.Control.ZoomBox({out:true}),
            map: me.map,
            iconCls: 'silk-magifier_zoom_out',
            toggleGroup: me.toggleGroup,
            activateOnEnable: true,
            deactivateOnEnable: true
        });
        var zoomOut = Ext.create('Ext.button.Button', me.actions.zoomOut);
        
        
        var scaleStore = Ext.create("GeoExt.data.ScaleStore", {map: me.map});
        me.actions.zoomSelector = Ext.create('GeoExt.Action', {
            store: scaleStore,
            emptyText: _('Scala'),
            listConfig: {
                getInnerTpl: function() {
                    return "1: {scale:round(0)}";
                }
            },
            triggerAction: 'all',
            queryMode: 'local',
            listeners: {
                specialkey: function(field, e) {
                    if (e.getKey() == e.ENTER) {
                        var scale = field.getValue();
                        if(scale.indexOf(':') > -1) {
                            var parts = scale.split(':');
                            scale = parts[1];
                        }
                        var resolution = OpenLayers.Util.getResolutionFromScale(scale, 'm');
                        me.map.zoomTo(me.map.getZoomForResolution(resolution));
                        e.preventDefault();
                    }
                }
            }
        });
        
        var zoomSelector = Ext.create('Ext.form.ComboBox', me.actions.zoomSelector);
        zoomSelector.on('select', 
            function(combo, record, index) {
                me.map.zoomTo(record[0].get("level"));
            },
            this
        );     
        
        me.map.events.register('zoomend', this, function() {
			var currentRes = me.map.getResolution();
			var scale = Math.round(OpenLayers.Util.getScaleFromResolution(currentRes, 'm'));
            zoomSelector.setValue("1 : " + parseInt(scale));
        });
        
        var measureLength = Ext.widget('measurelengthtool', {
            map: me.map,
            iconCls: 'silk-measure-line',
            tooltip: _('Misura linea'),
            toggleGroup: me.toggleGroup
        });        
        var measureArea = Ext.widget('measureareatool', {
            toggleGroup: me.toggleGroup,
            tooltip: _('Misura area'),
            iconCls: 'silk-measure-area',
            map: me.map
        });
            
        items = [ZoomToMaxExtent, ' ', dragPan, '-',
            zoomPrev, ' ', zoomNext, '-',
            zoomIn, ' ', zoomOut, '-', zoomSelector, '-',
            measureLength, measureArea, '-'];
            
        for(var i = 0; i < me.tools.length; i++) {
            tool = me.tools[i];
            items.push(tool);
        }

        me.items = items;
        
        me.callParent(arguments);
    }
});