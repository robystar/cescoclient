Ext.define('Map.view.ReferenceMap', {
    extend: 'Ext.panel.Panel',
    actions: {},
    
    alias: 'widget.referencemap',
    height: 190,
    bodyPadding: 5,
    bbar: [
        _('Zoom')+': ',
        {text: _('Vista corrente'), toggleGroup: 'viewmap'},
        {text: _('Massima estensione'), toggleGroup: 'viewmap'}
    ],
    
    initComponent: function() {
        var me = this;

        me.items = [
            {html: '<img src="resources/images/map.png" />', border: false}
        ];
        
        me.callParent(arguments);
    }
});