Ext.define('R3Base.map.view.Legend', {
    extend: 'GeoExt.panel.Legend',

    alias: 'widget.legendpanel',
    defaults: {
        baseParams: {
            FORMAT: 'image/png; mode=8bit'
        }
    }
 
});