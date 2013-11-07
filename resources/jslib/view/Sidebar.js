Ext.define('Map.view.Sidebar', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mapsidebar',
    map: undefined, //required
    layerTreeStore: undefined, //required per il layertree
    searchStore: undefined, //required per il tab ricerca
    
    requires: ['GeoExt.panel.Legend', 'Map.view.LayerTree', 'Map.view.SearchForm', 'Map.view.LayerTree', 'Map.view.QueryResult', 'Map.view.SelectionToolbar', 'Map.view.ReferenceMap'],
    
    layout: 'anchor',
    region: 'east',
    collapsible: true,
    split: true,
    header: false,
    collapsed: true,
    titleCollapse: true,
    width: 250,
    floatable: false,
    
    initComponent: function() {
        var me = this,
            tabHeight = '100%';
            tabItems = [];
        
        
        tabItems = [
            {
                xtype: 'layertree',
                autoScroll: true,
                title: _('Livelli'),
                store: me.layerTreeStore,
                rootVisible: false,
                header: true,
                map: me.map
            }, {
                xtype: 'gx_legendpanel',
                title: _('Legenda'),
                bodyPadding: 5,
                autoScroll: true,
                cls: 'tab_legend',
                layerStore: Ext.create('GeoExt.data.LayerStore', {
                    map: me.map
                })
            }
        ];
        
        if(me.searchStore) {
            tabItems.push({
                title: _('Ricerca'),
                autoScroll: true,
                xtype: 'mapsearchform',
                searchStore: me.searchStore
            });
        };
        
        
        // serve solo da prova, se va bene spostare
        tabItems.push({
            title: _('Taglia database'),
            bodyPadding: 5,
            autoScroll: true,
            items: [{
                xtype: 'tabpanel',
                border: false,
                defaults: {border: false},
                bodyPadding: 5,
                items: [{
                    title: _('Taglia DB Topografico'),
                    items: [{
                        xtype: 'displayfield',
                        labelWidth: 300,
                        fieldLabel: _('Traccia una linea per tagliare le geometrie')
                    }, {
                        xtype: 'grid',
                        columns: [{
                            text: _('Tabella'),
                            flex: 1
                        }, {
                            text: _('Identificativo'),
                            flex: 1
                        }, {
                            text: _('Area'),
                            flex: 1
                        }]
                    }, {
                        xtype: 'fieldset',
                        layout: 'form',
                        title: 'Snap',
                        items: [{
                            xtype: 'combobox',
                            fieldLabel: 'Snap layer'
                        }, {
                            xtype: 'checkbox',
                            fieldLabel: 'Evidenzia vertici'
                        }, {
                            xtype: 'slider',
                            fieldLabel: 'Tolleranza',
                            value: 10
                        }]
                    }]
                }, {
                    title: _('Elimina'),
                    items: [{
                        xtype: 'displayfield',
                        labelWidth: 300,
                        fieldLabel: _('Seleziona un edificio tagliato per ripristinare la versione precedente')
                    }, {
                        xtype: 'grid',
                        columns: [{
                            text: _('Tabella'),
                            flex: 1
                        }, {
                            text: _('Identificativo'),
                            flex: 1
                        }, {
                            text: _('Genitore'),
                            flex: 1
                        }, {
                            text: _('Versione'),
                            flex: 1
                        }, {
                            text: _('Area'),
                            flex: 1
                        }]
                    }]
                }]
            }]
        })
        
        me.items = [{
            xtype: 'tabpanel',
            border: false,
            defaults: {border: false},
            anchor: '100% -190',
            items: tabItems
        }, {
            xtype: 'referencemap'
        }];
        
        me.callParent(arguments);
    }
    
});