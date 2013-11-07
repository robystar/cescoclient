Ext.define('Map.view.EditingToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    region: 'north',
    alias: 'widget.mapeditingtoolbar',
    
    actions: {}, //required
    
    initComponent: function() {
        var me = this;

        me.items = [
            Ext.create('Ext.button.Button', me.actions.drawPolygon),
            Ext.create('Ext.button.Button', me.actions.drawLineString),
            Ext.create('Ext.button.Button', me.actions.drawPoint),
            '-',
            Ext.create('Ext.button.Button', me.actions.editGeometry),
            Ext.create('Ext.button.Button', me.actions.transformGeometry),
            Ext.create('Ext.button.Button', me.actions.deleteGeometry),
            '->',
            {
                xtype: 'button',
                text: _('Salva'),
                iconCls: 'silk-disk',
                tooltip: _('Salva modifiche'),
                r3action: 'save'
            },{
                xtype: 'button',
                text: _('Annulla'),
                iconCls: 'silk-arrow_undo',
                tooltip: _('Annulla modifiche'),
                r3action: 'undo'
            },'-',{
                xtype: 'button',
                text: _('Snap'),
                tooltip: 'Snap',
                menu: {
                    xtype: 'menu',
                    width: 200,
                    plain: true,
                    items: [{
                        xtype: 'combobox',
                        emptyText: 'Snap'
                    }, {
                        xtype: 'checkbox',
                        fieldLabel: _('Mostra vertici')
                    }, {
                        xtype: 'slider',
                        fieldLabel: _('Tolleranza'),
                        value: 10,
                        increment: 1,
                        minValue: 0,
                        maxValue: 100
                    }]
                }
            },'-',{
                xtype: 'button',
                tooltip: _('Aiuto'),
                iconCls: 'silk-help',
                listeners: {
                    click: function(event, btn) {
                        Ext.create('Ext.window.Window', {
                            x: '25%',
                            y: '25%',
                            title: 'Aiuto',
                            iconCls: 'silk-help',
                            items: [{
                                xtype: 'container',
                                style: {
                                    backgroundColor: 'white',
                                    paddingTop: '10px',
                                    paddingRight: '10px',
                                    paddingLeft: '10px'
                                },
                                html: '<div><p>1. '+_('Cliccare sulla mappa per inserire il primo punto.</p><p>2. Cliccare sulla mappa per inserire i punti successivi. </p><p>3. Per chiudere la geometria effettaure doppio clic sull\'ultimo punto.')+'</p></div>'
                            }]
                        }).show();
                    }
                }
            }
        ];

        me.callParent(arguments);
    }
});