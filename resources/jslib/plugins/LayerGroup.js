/**
 * The LayerGroup plugin. This is used to create a node that act as a layergroup
 *     {plugins: ['layergroup'], ...}
 *
 * See GeoExt.data.LayerTreeModel for more details on GeoExt extensions to the
 * node configuration.
 */
Ext.define('Map.plugins.LayerGroup', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.layergroup',

    /**
     * @private
     * The init method is invoked after initComponent method has been run for
     * the client Component.
     *
     * It perform plugin initialization.
     * @param {Ext.Component} target The client Component which owns this plugin.
     */
    init: function(target) {
        var me = this,
            checked = true,
            layer;
        
        target.eachChild(function(node) {
            layer = node.get('layer');
            if(!layer.getVisibility()) checked = false;
            layer.events.on({
                'visibilitychanged' : me.onChildLayerVisibilityChanged,
                scope: me
            });
            node.on('afteredit', function(node, modifiedFields) {
                if(~Ext.Array.indexOf(modifiedFields, 'isLoading')) {
                    me.onChildIsLoadingChange();
                }
            });
        });
        target.set('checked', checked);
        
        target.on('afteredit', function(node, modifiedFields) {
            if(~Ext.Array.indexOf(modifiedFields, 'checked')) {
                me.onCheckChange();
            }
        });
        
        me.target = target;
    },

    /**
     * @private
     * Updates the visibility of the child layers
     * node. 
     */
    onCheckChange: function() {
        var node = this.target,
            checked = this.target.get('checked');

        if(!node._visibilityChanging) return;
        
        node._visibilityChanging = true;
        node.eachChild(function(node) {
            node.get('layer').setVisibility(checked);
        });
        delete node._visibilityChanging;
    },
    
    onChildLayerVisibilityChanged: function() {
        var node = this.target;
        
        if(!node._visibilityChanging) return;
        
        var checked = true;
        node.eachChild(function(childNode) {
            if(!childNode.get('layer').getVisibility()) checked = false;
        });
        node._visibilityChanging = true;
        node.set('checked', checked);
        delete node._visibilityChanging;
    },
    
    onChildIsLoadingChange: function() {
        var node = this.target;
        
        var isLoading = false;
        node.eachChild(function(childNode) {
            if(childNode.get('isLoading')) isLoading = true;
        });
        node.set('isLoading', isLoading);
    }
    

});