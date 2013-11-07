Ext.define('Map.view.LayerOption', {
    extend: 'Ext.container.Container',
    alias: 'widget.layeroptions',
    
    initComponent: function() {
        var me = this;
        
        me.items = [{
            xtype: 'gx_opacityslider',
            fieldLabel: _('Opacità'),
            //layer: layers,
            width: 250
        }, {
            xtype: 'container',
            layout: 'hbox',
            items: [{
                xtype: 'textfield',
                fieldLabel: _('Buffer'),
                width: 180
            }, {
                xtype: 'displayfield',
                style: {
                    marginLeft: '5px'
                },
                fieldLabel: 'm',
                labelSeparator: ''
            }]
        }];
        
        me.callParent(arguments);
    }
});