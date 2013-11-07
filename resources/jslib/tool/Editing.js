Ext.define('Map.tool.Editing', {
    extend: 'Ext.button.Button',
    requires: ['Map.view.EditingToolbar'/* , 'Map.view.SnapToolbar' */],
    
    alias: 'widget.mapediting',
    
    /**
     * @cfg {OpenLayers.Map} (required)
     * The OpenLayers map that the control should be added
     * to.  For controls that don't need to be added to a map or have already
     * been added to one, this config property may be omitted.
     */
    map: null,
    
    //private
    toolbar: null,
    actions: null,
    layer: null,
    active: false,
    
    enableToggle: true,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('toggle', function(button, pressed) {
            if(pressed) me.startEdit();
            else me.stopEdit();
        });
    },
        
    startEdit: function() {
        if(this.active) return;
        if(!this.getLayer().map) this.map.addLayer(this.getLayer());
        this.createToolbar();
        this.toggle(true, true);
        this.active = true;
    },
    
    stopEdit: function() {
        if(!this.active) return;
        if(this.getLayer().map) this.map.removeLayer(this.getLayer());
        this.destroyToolbar();
        this.toggle(false, true);
        this.active = false;
    },

    isActive: function() {
        return this.active;
    },
    
    createToolbar: function() {
        var me = this,
            actions = this.getActions();

        me.toolbar = Ext.widget('mapeditingtoolbar', {
            actions: actions
        });
        me.toolbar.down('button[r3action="save"]').on('click', function() {
            me.fireEvent('save');
        });
        
        /*me.toolbar.down('button[r3action="snap"]').on('toggle', function(button, pressed) {
            if(pressed) me.createSnapToolbar();
            else me.destroySnapToolbar();
        });*/
        
        me.up('panel').addDocked(me.toolbar);
        me.map.updateSize();
    },
    
    destroyToolbar: function() {
        var me = this;
        Ext.suspendLayouts();
        /* if(me.snapToolbar){
            me.destroySnapToolbar();
        } */
        me.up('panel').removeDocked(me.toolbar, true);
        Ext.resumeLayouts(true);
        me.map.updateSize();
    },    
    
    /* createSnapToolbar: function() {
        var me = this;
        me.snapToolbar = Ext.widget('snaptoolbar', {
            
        });
        me.up('panel').addDocked(me.snapToolbar);
        me.map.updateSize();
    }, */
    
    /* destroySnapToolbar: function() {
        var me = this;
        me.up('panel').removeDocked(me.snapToolbar, true);
        me.map.updateSize();
    }, */
    
    getActions: function() {
        if(!this.actions) this.initActions();
        return this.actions;
    },
    
    setGeometry: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.getLayer().addFeatures([feature]);
    },
    
    getGeometry: function() {
        var feature = this.getLayer().features[0];
        return feature.geometry;
    },
    
    createLayer: function() {
    
        var cursors = ["sw-resize", "s-resize", "se-resize", "e-resize", "ne-resize", "n-resize", "nw-resize", "w-resize"];
        var transformContext = {
            getCursor: function(feature){
                var controls = gisclient.map.getControlsByClass('OpenLayers.Control.TransformFeature');
                var i = OpenLayers.Util.indexOf(controls[0].handles, feature);
                var cursor = "inherit";
                if(i !== -1) {
                    i = (i + 8 + Math.round(controls[0].rotation / 90) * 2) % 8;
                    cursor = cursors[i];
                }
                return cursor;
            }
        };

        // styles for the vector layer
        var styles = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            pointRadius: 5,
                            graphicName: "square",
                            fillColor: "white",
                            fillOpacity: 0.25,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#3333aa"
                        },
                        "Line": {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: "#6666aa"
                        },
                        "Polygon": {
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            fillColor: "#9999aa",
                            strokeColor: "#6666aa"
                        }
                    }
                })]
            }),
            "select": new OpenLayers.Style(null, {
                rules: [
                new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            pointRadius: 5,
                            graphicName: "square",
                            fillColor: "white",
                            fillOpacity: 0.25,
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#0000ff"
                        },
                        "Line": {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: "#0000ff"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            fillColor: "#0000ff",
                            strokeColor: "#0000ff"
                        }
                    }
                })
                ]
            }),
            "temporary": new OpenLayers.Style(null, {
                rules: [
                new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            graphicName: "square",
                            pointRadius: 5,
                            fillColor: "white",
                            fillOpacity: 0.25,
                            strokeWidth: 2,
                            strokeColor: "#0000ff"
                        },
                        "Line": {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: "#0000ff"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#0000ff",
                            fillColor: "#0000ff"
                        }
                    }
                })
                ]
            }),
            "transform": new OpenLayers.Style({
                cursor: "${getCursor}",
                pointRadius: 5,
                fillColor: "white",
                fillOpacity: 1,
                strokeColor: "black"
            }, {
                context: transformContext
            })
        });
            
        this.layer = new OpenLayers.Layer.Vector('Draw layer', {
            styleMap: styles
        });
    },
    
    getLayer: function() {
        if(!this.layer) this.createLayer();
        return this.layer;
    },
    
    initActions: function(config) {
        var me = this;
        
        me.actions = {
            drawPolygon: Ext.create('GeoExt.Action', {
                text: _('Poligono'),
                iconCls: 'silk-draw-polygon',
                control: new OpenLayers.Control.DrawFeature(me.getLayer(), OpenLayers.Handler.Polygon),
                map: me.map,
                toggleGroup: 'editingtogglegroup',
                tooltip: _('Disegna poligono'),
                allowDepress: false,
                activateOnEnable: true,
                deactivateOnEnable: true
            }),
            drawLineString: Ext.create('GeoExt.Action', {
                text: _('Linea'),
                iconCls: 'silk-draw-line',
                control: new OpenLayers.Control.DrawFeature(me.getLayer(), OpenLayers.Handler.Path),
                map: me.map,
                toggleGroup: 'editingtogglegroup',
                allowDepress: false,
                tooltip: _('Disegna linea'),
                activateOnEnable: true,
                deactivateOnEnable: true
            }),
            drawPoint: Ext.create('GeoExt.Action', {
                text: _('Punto'),
                control: new OpenLayers.Control.DrawFeature(me.getLayer(), OpenLayers.Handler.Point),
                map: me.map,
                iconCls: 'silk-draw-point',
                toggleGroup: 'editingtogglegroup',
                allowDepress: false,
                tooltip: _('Disegna punto'),
                activateOnEnable: true,
                deactivateOnEnable: true
            }),
            editGeometry: Ext.create('GeoExt.Action', {
                text: _('Modifica'),
                iconCls: 'silk-pencil',
                map: me.map,
                control: new OpenLayers.Control.ModifyFeature(me.getLayer()),
                toggleGroup: 'editingtogglegroup',
                allowDepress: false,
                tooltip: _('Modifica'),
                activateOnEnable: true,
                deactivateOnEnable: true
            }),
            transformGeometry: Ext.create('GeoExt.Action', {
                text: _('Trasforma'),
                iconCls: 'silk-transform',
                map: me.map,
                control: new OpenLayers.Control.TransformFeature(me.getLayer()),
                toggleGroup:  'editingtogglegroup',
                allowDepress: false,
                tooltip: _('Trasforma'),
                activateOnEnable: true,
                deactivateOnEnable: true
            }),
            deleteGeometry: Ext.create('GeoExt.Action', {
                text: _('Elimina'),
                iconCls: 'silk-cross',
                map: me.map,
                toggleGroup: 'editingtogglegroup',
                control: new OpenLayers.Control.SelectFeature(me.getLayer()),
                allowDepress: false,
                tooltip: _('Elimina'),
                activateOnEnable: true,
                deactivateOnEnable: true
            })
        };

    }
});