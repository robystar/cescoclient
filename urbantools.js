Ext.require('Ext.direct.Manager');

Ext.onReady(function() {
    Ext.Loader.setConfig({
        enabled:true
    });
    Ext.Loader.setPath('R3Base', 'base');
    Ext.Loader.setPath('Ext.ux', 'lib/ux');
    Ext.Loader.setPath('GeoExt', 'geoext2/src/GeoExt');
    Ext.Loader.setPath('R3Plugins', 'plugins');
    Ext.Loader.setPath('Map', 'base/map/');
    Ext.require(['R3Base.Util']);
    
    Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	
    Ext.create('R3Base.app.Application', {
        name: 'Urbantools',
        controllers: ['Map', 'HouseNumber', 'Access', 'Pertinence', 'Project', 'Street', 'PersonalSettings', 'HeaderToolbar', 'AccessType', 'AccessKind', 'AccessGate', 'IntendedUse', 'Resident', 'Image', 'Document' , 'User', 'Domain', 'Application', 'Group', 'Building', 'MinorBuilding', 'Cadastre', 'Fraction', 'Municipality', 'MapError', 'DbtUpdate', 'MapErrorStatus', 'DbtProfessional'],
        launch: function() {
            var me = this;
            
            me.treeStore = Ext.create('Ext.data.TreeStore', {
                root: {
                    children: R3AppConfig.menu
                }
            });
            
            me.treePanel = Ext.create('Urbantools.view.TreeMenu', {
                rootVisible: false,
                useArrows: true,
                margin: '5 5 5 5',
                cls: 'no-leaf-icons',
                title: 'Menu',
                resizable: true,
                region: 'west',
                width: 220,
                minWidth: 155,
                id: 'appmenu',
                stateId: 'treemenu',
                collapsible: true,
                store: me.treeStore,
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            text: 'Apri mappa',
                            flex: 1,
                            textAlign: 'left',
                            iconCls: 'silk-map_magnify',
                            r3action: 'openmap',
                            handler: function(button, event){
                                me.getController('Map').showMap();
                            }
                        }
                    ]
                }],
                listeners: {
                    itemclick: function(view, node) {
                        if(!node.isLeaf()) {
                            if(node.isExpanded()) {
                                node.collapse();
                            } else {
                                node.expand();
                            }
                        }
                    },
                    selectionchange: {fn: me.handleMenuChange, scope: me}
                } 
                
                
            });
            
            me.centerPanel = Ext.create('Ext.container.Container', {
                layout: 'fit',
                margin: '5 0 0 0',
                region:'center'
            });
            
            me.viewport = Ext.create('Ext.container.Viewport', {
                layout: 'border',
                items: []
            });
            me.viewport.add(me.treePanel);
            me.viewport.add(me.centerPanel);
            me.viewport.add({xtype: 'headertoolbar'});
            
            // fine del loading, relativa scomparsa della schermata di waiting
            Ext.get('loading').remove();
            Ext.get('loading-mask').fadeOut({remove:true});
        },
        
        //TODO: rivedere (aggiungere metodo x controller?)
        handleMenuChange: function(panel, records) {
            var selected = records[0];
            if(selected.raw.startController) {
                this.startController(selected.raw.startController, this.centerPanel);
            } 
        },
    
        handleLink: function(link) {
            var me = this;

            if(link.obj_t && link.obj_id) {
                var controllerName,
                    controller,
                    model;
                    
                me.treeStore.getRootNode().cascadeBy(function(object) {
                    if(object.raw.obj_t == link.obj_t) controllerName = object.raw.startController;
                });
                if(controllerName) {
                    controller = me.getController(controllerName);
                    model = Ext.ModelManager.getModel(controller.mainModel);
                    model.load(link.obj_id, {
                        hnr_id: 1, // work in progress...
                        scope: this,
                        success: function(record) {
                            var store = controller.getStore(controller.mainStore);
                            
                            store.add(record);
                            controller.startEdit(record, store);
                        },
                        failure: function() {
                            alert('failed to load record');
                        }
                    });
                } else console.log('cannot find controller for '+link.obj_t);
            } else console.log('invalid link');
        }
    });
});

if(typeof(console) == 'undefined') { console = {log:function(){}, trace:function(){}}; }

function _(string) {
    return string;
}


Ext.define('Ext.overrides.Base', {
    override: 'Ext.Base',

    /**
     * TODO:  REMOVE WHEN ext UPGRADED TO 4.1.3
     */
     callSuper: function(args) {
        var method,
            superMethod = (method = this.callSuper.caller) &&
                    ((method = method.$owner ? method : method.caller) &&
                      method.$owner.superclass[method.$name]);

        //<debug error>
        if (!superMethod) {
            method = this.callSuper.caller;
            var parentClass, methodName;

            if (!method.$owner) {
                if (!method.caller) {
                    throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                }

                method = method.caller;
            }

            parentClass = method.$owner.superclass;
            methodName = method.$name;

            if (!(methodName in parentClass)) {
                throw new Error("this.callSuper() was called but there's no such method (" + methodName +
                            ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
            }
        }
        //</debug>

        return superMethod.apply(this, args || []);
    }
});