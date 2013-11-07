Ext.define('Map.view.SelectionToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    region: 'north',
    alias: 'widget.selectiontoolbar',
    
    wfsServices: null, //requried
    
    initComponent: function() {
        var me = this,
            toolbarItems = [];
           
        var geometryType = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: _('Tipo geometria:'),
            name: 'draw_type',
            labelAlign: 'left',
            store: Ext.create('Ext.data.Store', {
                fields: ['name', 'title'],
                data: [
                    {name: 'box', title: _('Box')},
                    {name: 'point', title: _('Punto')},
                    {name: 'polygon', title: _('Poligono')},
                    {name: 'circle', title: _('Cerchio')}
                ]
            }),
            displayField: 'title',
            valueField: 'name'
        });

        var onLayers = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: '',
            emptyText: _('Livelli'),
            store: me.wfsServices,
            name: 'wfs_service',
            labelAlign: 'left',
            displayField: 'text',
            valueField: 'typeName'
        });
        
        var actionAfterSelection = Ext.create('Ext.form.RadioGroup', {
            layout: 'hbox',
            fieldLabel: _('Azione dopo selezione'),
            name: 'afterSelectionAction',
            labelWidth: 130,
            items: [
                {boxLabel: _('Zoom'), name: 'afterSelectionAction', inputValue: 'zoom', style: {marginRight: '10px'}, checked: true},
                {boxLabel: _('Centra'), name: 'afterSelectionAction', inputValue: 'center', style: {marginRight: '10px'}},
                {boxLabel: _('Nessuna'), name: 'afterSelectionAction', inputValue: 'none', style: {marginRight: '10px'}}
            ],
            labelAlign: 'right'
        });

        var buttonSelection = Ext.create('Ext.button.Button', {
            text: _('Usa gli oggetti selezionati')
        });
        
        var buttonUndo = Ext.create('Ext.button.Button', {
            text: _('Annulla selezione')
        });
        
        me.items = [
            geometryType, onLayers, ' ', actionAfterSelection, buttonSelection, buttonUndo
        ];
        
        me.callParent(arguments);
    }
});
