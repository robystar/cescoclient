Ext.define('Map.view.LayerTree', {
    extend: 'GeoExt.tree.Panel',
    alias: 'widget.layertree',
    map: null, //required
    
    viewConfig: {
        plugins: {
            ptype: 'layertreeviewdragdrop'
        }
    },
    plugins: {
        ptype: 'nodecheckboxdisabled'
    },
    requires: ['Ext.ux.CheckColumn', 'GeoExt.slider.LayerOpacity'],

    initComponent: function() {
        var me = this;

        me.columns = [{
            xtype: 'gx_treecolumn',
            text: 'Name',
            flex: 1,
            dataIndex: me.displayField
        }, {
            xtype: 'checkcolumn',
            width: 30,
            menuText: 'Selezionati',
            dataIndex: 'checked'
        }, {
            xtype: 'actioncolumn',
            width: 30,
            menuText: _('Opzioni'),
            iconCls: 'silk-tool',
            r3action: 'layeropacity',
            tooltip: _('Opzioni')
        }, {
            xtype: 'checkcolumn',
            width: 30,
            menuText: _('Loading'),
            dataIndex: 'isLoading',
            processEvent: function() { return false; },
            tdCls: 'loading-checkbox-td'
        }];

        me.callSuper(arguments);
        
        me.getStore().getRootNode().cascadeBy(function(record) {
            var oldIndex, indexVariation;
            record.on('beforemove', function(node, oldParent, newParent, index) {
                if(oldParent != newParent) return false;
                oldIndex = oldParent.indexOf(node);
            });
            record.on('move',  function(node, oldParent, newParent, index) {
                indexVariation = oldIndex - oldParent.indexOf(node);
                me.map.raiseLayer(node.get('layer'), indexVariation);
            });
            
            if(record.get('layer')) {
                record.get('layer').events.register('loadstart', null, function() {
                    record.set('isLoading', true);
                });
                record.get('layer').events.register('loadend', null, function() {
                    record.set('isLoading', false);
                });
            }
        });
        
        me.map.events.register('zoomend', null, function() {
            me.getStore().getRootNode().cascadeBy(function(record) {
                if(!record.get('layer')) return;
                var disabled = !record.get('layer').calculateInRange();
                if(disabled != record.get('disabled')) {
                    record.set('disabled', disabled);
                }
            });
            me.getStore().getRootNode().cascadeBy(function(record) {
                if(record.get('layer')) return;
                var disabled = true;
                record.eachChild(function(childRecord) {
                    if(!childRecord.get('disabled')) disabled = false;
                });
                if(disabled != record.get('disabled')) {
                    record.set('disabled', disabled);
                }
            });
        });
    }
});



Ext.define('Map.plugins.LayerTreeViewDragDrop', {
    extend: 'Ext.tree.plugin.TreeViewDragDrop',
    alias: 'plugin.layertreeviewdragdrop',
    
    onViewRender: function(view) {
        var me = this;

        if (me.enableDrag) {
            me.dragZone = new Ext.tree.ViewDragZone({
                view: view,
                ddGroup: me.dragGroup || me.ddGroup,
                dragText: me.dragText,
                repairHighlightColor: me.nodeHighlightColor,
                repairHighlight: me.nodeHighlightOnRepair
            });
        }

        if (me.enableDrop) {
            me.dropZone = new Map.plugins.ViewDropZone({
                view: view,
                ddGroup: me.dropGroup || me.ddGroup,
                allowContainerDrops: me.allowContainerDrops,
                appendOnly: me.appendOnly,
                allowParentInserts: me.allowParentInserts,
                expandDelay: me.expandDelay,
                dropHighlightColor: me.nodeHighlightColor,
                dropHighlight: me.nodeHighlightOnDrop
            });
        }
    }
});

Ext.define('Map.plugins.ViewDropZone', {
    extend: 'Ext.tree.ViewDropZone',
    
    isValidDropPoint : function(targetNode, position, dragZone, e, data) {
        var returnValue = this.callParent(arguments);
        if(returnValue) {
            returnValue = false;
            if(this.view.getRecord(targetNode).parentNode.id == data.records[0].parentNode.id) returnValue = true;
        }
        return returnValue;
    }
});

Ext.define('R3Plugins.NodeDisabled', {
    alias: 'plugin.nodecheckboxdisabled',
    extend: 'Ext.AbstractPlugin',
    
    
    //configurables
    /**
     * @cfg {String} disabledCls
     * The CSS class applied when the {@link Ext.data.Model} of the node has a 'disabled' field with a true value.
     */
    disabledCls: 'tree-node-disabled',
    /**
     * @cfg {Boolean} preventSelection 
     * True to prevent selection of a node that is disabled. Default true.
     */
    preventSelection: true,
    
    //properties
    
    /**
     * @private
     * @param {Ext.tree.Panel} tree
     */
    init: function(tree) {
        var me = this,
            view = tree.getView(),
            origFn,
            origScope;
        
        me.callParent(arguments);
        
        origFn = view.getRowClass;
        if (origFn){
            origScope = view.scope || me;
            Ext.apply(view,{
                //append our value to the original function's return value
                getRowClass: function(){
                    var v1,v2;
                    v1 = origFn.apply(origScope,arguments) || '';
                    v2 = me.getRowClass.apply(me,arguments) || '';
                    return (v1 && v2) ? v1+' '+v2 : v1+v2;
                }
            });
        } else {
            Ext.apply(view, {
                getRowClass: Ext.Function.bind(me.getRowClass,me)
            });
        }
        
        Ext.apply(view, {
            //if our function returns false, the original function is not called
            onCheckChange: Ext.Function.createInterceptor(view.onCheckChange,me.onCheckChangeInterceptor,me)
        });
    }, // eof init
    
    /**
     * Returns a properly typed result.
     * @return {Ext.tree.Panel}
     */
    getCmp: function() {
        return this.callParent(arguments);
    }, //eof getCmp 
    
    /**
     * @private
     * @param {Ext.data.Model} record
     * @param {Number} index
     * @param {Object} rowParams
     * @param {Ext.data.Store} ds
     * @return {String}
     */
    getRowClass: function(record,index,rowParams,ds){
        return record.get('disabled') ? this.disabledCls : '';
    },//eof getRowClass
    
    /**
     * @private
     * @param {Ext.data.Model} record
     */
    onCheckChangeInterceptor: function(record) {
        if (record.get('disabled')){ 
            return false; 
        }
    }//eof onCheckChange

});//eo class