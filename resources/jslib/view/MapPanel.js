Ext.define('Map.view.MapPanel', {
    extend: 'GeoExt.panel.Map',
    alias: 'widget.mappanel',
    region: 'center',
    height: 25, 
    geolocator: null,
    /**
     * @cfg {String} projectionDescription
     * 
     * Il sistema di riferimento della mappa
    */
    projectionDescription: undefined,
    
    initComponent: function() {
        var me = this,
            items = [];
        
        me.callParent(arguments);
        
        if(me.geolocator) {
            items.push(me.geolocator, '-');
        }
        
        items.push({
            xtype: 'tbtext',
            r3role: 'mapInfoMousePosition',
            id: 'problem_mouseposition',
            text: '',
            width: 160
        }, '-', {
            xtype: 'tbtext',
            r3role: 'projectiondescription',
            text: '',
            width: 160
        });
            

        me.addDocked({
            xtype: 'toolbar',
            dock: 'bottom',
            items: items
        });
        

        
        me.on('afterrender', function() {
            var mousePositionComponent = me.down('tbtext[r3role="mapInfoMousePosition"]');
            if(mousePositionComponent) {
                me.map.addControl(
                    new OpenLayers.Control.MousePosition({
                        element: mousePositionComponent.getEl().dom
                    })
                );
            }
            
            if(me.projectionDescription) {
                var projectionDescriptionComponent = me.down('tbtext[r3role="projectiondescription"]');
                if(projectionDescriptionComponent) {
                    projectionDescriptionComponent.setText(me.projectionDescription);
                }
            }
        });
    }
    
});