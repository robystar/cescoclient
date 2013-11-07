// attualmente non in uso
Ext.define('R3Base.map.LayerModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'name', type: 'string'},
        {name: 'title', type: 'string'},
        {name: 'text', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'parameters'},
        {name: 'options'},
        {name: 'olLayer'},
        {name: 'featureType', type: 'string'},
        {name: 'isLoading', type: 'boolean'}
    ],
    proxy: {
        type: 'memory',
        reader: {type: 'json'}
    },
    
    getLayer: function() {
        var olLayer = this.get('olLayer');
        if(!olLayer || olLayer == ' ') return false;
        return olLayer;
    },
    
    /**
     * @private
     */
    afterEdit: function(modifiedFieldNames) {
        var me = this;
        me.callParent(arguments);
        me.fireEvent('afteredit', this, modifiedFieldNames);
    }
});