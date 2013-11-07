/* FILE NON IN USO */

Ext.define('Map.view.SnapToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    region: 'north',
    alias: 'widget.snaptoolbar',
    r3action: 'snap_toolbar',
    actions: {},
    
    initComponent: function() {
        var me = this,
            toolbarItems = [];
    
        var navigationToggleGroup = 'navigation';
        
        var snapLayer = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: 'Snap:',
            labelWidth: 50,
            labelAlign: 'left',
            labelStyle: 'font-weight:bold;'
        });
        
        var highlightVertices = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: _('Mostra vertici')
        });
        
        var tollerance = Ext.create('Ext.slider.Single', {
            fieldLabel: _('Tolleranza'),
            width: 200,
            labelWidth: 60,
            labelAlign: 'right',
            value: 50,
            increment: 1,
            minValue: 0,
            maxValue: 100
        });

        me.items = [
            snapLayer, ' ', highlightVertices, ' ', tollerance
        ];
        
        me.callParent(arguments);
    }
});