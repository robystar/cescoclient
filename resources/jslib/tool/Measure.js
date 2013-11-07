Ext.define('Map.tool.Measure', {
    extend: 'Ext.button.Button',
    
    /**
     * @cfg {OpenLayers.Map} (required)
     * The OpenLayers map that the control should be added
     * to.  For controls that don't need to be added to a map or have already
     * been added to one, this config property may be omitted.
     */
    map: undefined,

    /**
     * @cfg controlOptions options for the {OpenLayers.Control.Measure} (required)
     * The OpenLayers measure Control options
     */
    controlOptions: undefined,

    /**
     * @cfg controlHandler handler function for the {OpenLayers.Control.Measure} (required)
     * The OpenLayers measure Control handler
     */    
    controlHandler: undefined,

    /**
     * @cfg measureLabel {String} label da visualizzare sul tooltip
     * 
     */    
    measureLabel: '',
    
    //private
    control: null,
    tip: null,
    segements: [],
    
    initComponent: function() {
        var me = this,
            control;

        me.control = me.createControl(me.controlHandler, me.controlOptions);
        me.map.addControl(me.control);
        
        me.callParent(arguments);
        
        me.on('toggle', function(button, pressed) {
            if(pressed) me.control.activate();
            else me.control.deactivate();
        });
    },
    
    createControl: function(handler, controlOptions) {
        var control,
            controlOptions = controlOptions || {};

        controlOptions = Ext.apply({
            persist: true
        }, controlOptions);
        control = new OpenLayers.Control.Measure(handler, controlOptions);
        control.events.register('measure', this, this.onMeasure);
        control.events.register('measurepartial', this, this.onMeasuring);
        return control;
    },
    
    onMeasure: function(event) {
        var geometry = event.geometry,
            vertices = geometry.getVertices(),
            lastPoint = vertices.slice(-1)[0],
            previousPoint = vertices.length > 1 ? vertices.slice(-2)[0] : null,
            lonLat = new OpenLayers.LonLat(lastPoint.x, lastPoint.y),
            pixel = this.map.getPixelFromLonLat(lonLat),
            html, distancePreviousPoint;

        var html = this.measureLabel+': '+Ext.util.Format.number(event.measure, '0.00')+ ' ' +event.units;
        this.getTip().update(html);
        this.getTip().showAt([pixel.x, pixel.y]);
    },
    
    onMeasuring: function(event) {
        return; //TODO!
        var geometry = event.geometry,
            vertices = geometry.getVertices();
            
        
			var self = this;
			if(self.options.last_point != null) {
				var pixel = event.xy;
				var point = gisclient.map.getLonLatFromPixel(pixel);
				var distance = self.options.last_point.distanceTo(new OpenLayers.Geometry.Point(point.lon, point.lat));
				if(distance > 1000) {
					distance = (distance/1000);
					var decimals = 3;
					var units = 'km';
				} else {
					var decimals = 1;
					var units = 'm';
				}
				$('#'+self.options.targetPartialDiv).html(OpenLayers.i18n('From last point')+' '+gisclient.numberFormat(distance, decimals)+' '+units);
			}
        console.log('on measuring');
        console.log(arguments);
    },
    
    getTip: function() {
        if(!this.tip) {
            this.tip = Ext.create('Ext.tip.ToolTip', {
                trackMouse: true,
                title: _('Misura')
            });
        }
        return this.tip;
    }
});