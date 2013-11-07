Ext.define('Map.tool.MeasureArea', {
    extend: 'Map.tool.Measure',
    alias: 'widget.measureareatool',
    
    enableToggle: true,
    
    measureLabel: _('Area'),
    
    initComponent: function() {
        this.controlHandler = OpenLayers.Handler.Polygon;
        this.callParent(arguments);
    }
});