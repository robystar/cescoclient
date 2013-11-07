Ext.define('Map.view.Rototraslation', {
    extend: 'Ext.window.Window',
    alias: 'widget.rototraslation',
    title: _('Rototraslazione'),
    //layout: 'fit',
    width: 350,
    height: 220,
    autoShow: true,
    
    initComponent: function() {
        var me = this;
        
        me.items = [{
            xtype: 'container',
            bodyPadding: 5,
            html: '<img src="resources/images/silkicons/information.png" style="margin-right: 5px;"/>'+_('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam massa lectus, iaculis eget hendrerit quis.'),
            border: true,
            style: {
                backgroundColor: '#fff6ba',
                border: '1px solid #ffd605',
                padding: '5px',
                margin: '5px'
            }
        }, {
            xtype: 'tabpanel',
            border: false,
            defaults: {border: false},
            bodyPadding: 5,
            items: [{
                title: _('Rototraslazione'),
                layout: 'vbox',
                items: [{
                    xtype: 'checkbox',
                    boxLabel: _('Mostra particelle vicine'),
                    name: 'show_neighbours'
                }, {
                    xtype: 'displayfield',
                    fieldLabel: 'Seleziona particelle da rototraslare',
                    labelWidth: 300
                }, {
                    xtype: 'grid',
                    width: '100%',
                    columns: [
                        {text: 'Tipo', flex: 1},
                        {text: 'Sheet', flex: 1},
                        {text: 'Numero', flex: 1},
                        {xtype: 'actioncolumn', width: 35}
                    ]
                }]
            }, {
                title: _('Elimina rototraslazione'),
                layout: 'vbox',
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Seleziona particelle sulle quali eliminare la rototraslazione',
                    labelWidth: 300
                }, {
                    xtype: 'grid',
                    width: '100%',
                    columns: [
                        {text: 'Tipo', flex: 1},
                        {text: 'Sheet', flex: 1},
                        {text: 'Numero', flex: 1},
                        {xtype: 'actioncolumn', width: 35}
                    ]
                }]
            }]
        }]
        
        me.callParent(arguments);
    }
});