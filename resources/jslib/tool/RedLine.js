Ext.define('Map.tool.RedLine', {
    extend: 'Ext.button.Button',
    alias: 'widget.redlinetool',
    requires: ['Map.view.RedLine'],
    
    active: false,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('toggle', function(button, pressed) {
            if(pressed) me.startRedLine();
            else me.stopRedLine();
        });
    },
    
    startRedLine: function() {
        if(this.active) return;
        this.createWindow();
        this.toggle(true, true);
        this.active = true;
    },
    
    stopRedLine: function() {
        if(!this.active) return;
        this.destroyWindow();
        this.toggle(false, true);
        this.active = false;
    },
    
    createWindow: function() {
        this.windowTool = Ext.widget('redline', { 
        });
    },
    
    destroyWindow: function() {
        this.windowTool.close();
    }
});