Ext.define('Map.tool.Selection', {
    extend: 'Ext.button.Button',
    requires: ['Map.view.SelectionToolbar'],
    
    alias: 'widget.mapselection',
    
    /**
     * @cfg {OpenLayers.Map} (required)
     * The OpenLayers map that the control should be added
     * to.  For controls that don't need to be added to a map or have already
     * been added to one, this config property may be omitted.
     */
    map: null,
    
    wfsServices: null, //required
    
    //private
    toolbar: null,
    control: null,
    activeDrawType: null,
    active: false,
    
    enableToggle: true,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('toggle', function(button, pressed) {
            if(pressed) me.startSelection();
            else me.stopSelection();
        });
    },
        
    startSelection: function() {
        if(this.active) return;
        this.createToolbar();
        this.toggle(true, true);
        this.activateSelection();
        this.active = true;
    },
    
    stopSelection: function() {
        if(!this.active) return;
        this.destroyToolbar();
        this.toggle(false, true);
        this.deactivateSelection();
        this.active = false;
    },
    
    activateSelection: function() {
        var drawTypeCombobox = this.selectionToolbar.down('combobox[name="draw_type"]'),
            selectedDrawType = drawTypeCombobox.getValue();

        if(!selectedDrawType) {
            drawTypeCombobox.setValue(drawTypeCombobox.getStore().getAt(0));
            selectedDrawType = drawTypeCombobox.getValue();
        }
        
        this.activateControl(selectedDrawType);
    },
    
    deactivateSelection: function() {
    },
    
    activateControl: function(type) {
        if(!this.control) this.createControl();
        if(this.activeDrawType) {
            this.control[this.activeDrawType].deactivate();
        }
        this.control[type].activate();
        this.activeDrawType = type;
    },

    isActive: function() {
        return this.active;
    },
    
    createToolbar: function() {
        var me = this;
            //actions = this.getActions();

        me.selectionToolbar = Ext.widget('selectiontoolbar', {
            wfsServices: me.wfsServices
        });
        
        me.up('panel').addDocked(me.selectionToolbar);
        me.map.updateSize();
    },
    
    destroyToolbar: function() {
        var me = this;
        me.up('panel').removeDocked(me.selectionToolbar, true);
        me.map.updateSize();
    },
    
    createControl: function() {
        var me = this;
        
        me.control = new OpenLayers.Control({autoActivate:false});
        OpenLayers.Util.extend(me.control, {
            draw: function () {
                this.box = new OpenLayers.Handler.Box(me.control,
                    {"done": function(geom) { me.handleDraw(geom); }}
                );
                this.polygon = new OpenLayers.Handler.Polygon(me.control,
                    {"done": function(geom) { me.handleDraw(geom); }}
                );
                this.circle = new OpenLayers.Handler.RegularPolygon(me.control,
                    {'done': function(geom) { me.handleDraw(geom); }},
                    {'sides':30}
                );
                this.point = new OpenLayers.Handler.Point(me.control,
                    {'done': function(geom) { me.handleDraw(geom); }}
                );
            },
            CLASS_NAME: 'OpenLayers.Control.selectByBox'
        });
        me.map.addControl(me.control);
    },
    
    handleDraw: function(geom) {
        var me = this,
            typeName = me.selectionToolbar.down('combobox[name="wfs_service"]').getValue(),
            afterSelectionAction = me.selectionToolbar.down('radiogroup[name="afterSelectionAction"]').getValue(),
            options = {
                afterSelectionAction: afterSelectionAction.afterSelectionAction
            }, queries = [], criterion;
            
        if(geom.CLASS_NAME == 'OpenLayers.Bounds') {
            var lb = me.map.getLonLatFromPixel(new OpenLayers.Pixel(geom.left, geom.bottom)); 
            var rt = me.map.getLonLatFromPixel(new OpenLayers.Pixel(geom.right, geom.top));
            criterion = {
                type: 'spatial',
                operator: 'BBOX',
                value: new OpenLayers.Bounds(lb.lon, lb.lat, rt.lon, rt.lat)
            };
        }
            
        queries.push({
            typeName: typeName,
            criteria: [criterion]
        });
        
        console.log(options);
        me.fireEvent('query', queries, options);
    }
});