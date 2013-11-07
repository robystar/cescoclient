Ext.define('Map.view.QueryResult', {
    defaults: {
        border: false
    },
    requires: ['R3Base.grid.column.Delete', 'R3Base.grid.column.View'],
    extend: 'Ext.grid.Panel',
    alias: 'widget.queryresult',
    collapsible: true,
    collapseFirst: true,
    tbar: ['->', {
        xtype: 'button',
        iconCls: 'silk-restore',
        text: '',
        tooltip: _('Visualizza risultati in tabella')
    }, {
        xtype: 'button',
        iconCls: 'silk-export',
        tooltip: _('Esporta')
    }],
    
    initComponent: function() {
        this.columns.push({
            xtype: 'viewcolumn',
            width: 24
        }, {
            xtype: 'actioncolumn',
            iconCls: 'silk-tooltip_info',
            tooltip: _('Visualizza tooltip'),
            resizable: false,
            width: 24,
            menuDisabled: true
        }, {
            xtype: 'deletecolumn',
            width: 24
        });
        
        this.callParent(arguments);
    },
    
    
});