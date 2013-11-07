Ext.define('Map.tool.MapPrint', {
    extend: 'Ext.button.Button',
    alias: 'widget.mapprinttool',
    requires: ['Map.view.MapPrint'],
    
    tooltip: _('Stampa'),
    iconCls: 'silk-printer',
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('click', function(button, event) {
            me.startPrint();
        });
    },
    
    startPrint: function() {
        this.createWindow();
    },
    
    createWindow: function() {
        var windows = Ext.ComponentQuery.query('mapprint');
        printWindow;
        for (var i=0; i<windows.length; i++) {
            printWindow = windows[i];
            printWindow.close();
        };
        var printWindow = Ext.widget('mapprint');
    }
});