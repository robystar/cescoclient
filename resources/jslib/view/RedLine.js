Ext.define('Map.view.RedLine', {
    extend: 'Ext.window.Window',
    alias: 'widget.redline',
    title: _('Annotazione'),
    width: 350,
    bodyPadding: 5,
    autoShow: true,
    defaults: {
        labelWidth: 95,
        labelAlign: 'right',
        width: '100%'
    },
    layout: 'vbox',
        
    initComponent: function() {
        var me = this;
        
        var drawGeom = Ext.create('Ext.data.Store', {
            fields: ['draw'],
            data : [
                {'draw': _('Linea')},
                {'draw': _('Poligono')},
                {'draw': _('Mano libera')}
            ]
        });
        
        me.items = [{
            xtype: 'container',
            bodyPadding: 5,
            html: '<img src="resources/images/silkicons/information.png" style="margin-right: 5px;"/>'+_('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam massa lectus, iaculis eget hendrerit quis, convallis in odio. Nulla pellentesque.'),
            border: true,
            style: {
                backgroundColor: '#fff6ba',
                border: '1px solid #ffd605',
                padding: '5px',
                margin: '0 0 5px 0'
            }
        }, {
            xtype: 'radiogroup',
            fieldLabel: _('Azione'),
            items: [{
                boxLabel: _('Crea'),
                name: 'redline_action',
                checked: true
            }, {
                boxLabel: _('Elimina'),
                name: 'redline_action'
            }]
        }, {
            xtype: 'combobox',
            store: drawGeom,
            fieldLabel: _('Disegna'),
            queryMode: 'local',
            displayField: 'draw',
            value: 'Linea'
        }, {
            xtype: 'checkbox',
            fieldLabel: _('Aggiungi testo')
        }]
        
        me.callParent(arguments);
    }
});