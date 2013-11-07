Ext.define('Map.tool.MeasureLength', {
    extend: 'Map.tool.Measure',
    alias: 'widget.measurelengthtool',
    
    enableToggle: true,
    
    measureLabel: _('Lunghezza'),
    
    initComponent: function() {
        this.controlHandler = OpenLayers.Handler.Path;
        this.callParent(arguments);
    }
});