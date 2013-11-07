Ext.define('Map.tool.Rototraslation', {
    extend: 'Ext.button.Button',
    alias: 'widget.rototraslationtool',
    requires: ['Map.view.Rototraslation'],
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('toggle', function(button, pressed) {
            if(pressed) me.startRototraslation();
            else me.stopRototraslation();
        });
    },
    
    startRototraslation: function() {
        if(this.active) return;
        this.createWindow();
        this.toggle(true, true);
        this.active = true;
    },
    
    stopRototraslation: function() {
        if(!this.active) return;
        this.destroyWindow();
        this.toggle(false, true);
        this.active = false;
    },
    
    createWindow: function() {
        this.windowTool = Ext.widget('rototraslation', { 
        });
    },
    
    destroyWindow: function() {
        this.windowTool.close();
    }
});