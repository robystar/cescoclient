Ext.define('Map.view.SearchForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.mapsearchform',
    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    border: false,
    bodyPadding: 10,
    fieldDefaults: {
        labelAlign: 'top'
    },
    
    searcheStore: undefined, //store di ricerche, required
    
    //private
    selectedSearch: undefined,
    
    initComponent: function() {
        var me = this;

        me.items = [{
            xtype: 'fieldcontainer',
            fieldDefaults: {
                labelAlign: 'top'
            },
            layout: 'fit',
            items: [{
                xtype: 'combobox',
                name: 'search',
                fieldLabel: _('Elenco dei temi per la ricerca'),
                store: me.searchStore,
                valueField: 'name',
                displayField: 'text',
                listeners: {
                    select: function(combobox, records) {
                        me.changeForm(records[0]);
                    }
                }
            }]
        }, {
            xtype: 'fieldset',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            title: _('Campi per la ricerca'),
            r3role: 'searchfields',
            items: []
        }, {
            xtype: 'fieldset',
            title: _('Azione dopo selezione'),
            items: [
                {
                    xtype: 'radiogroup',
                    defaultType: 'radiofield', 
                    name: 'afterSelectionAction',
                    r3role: 'optionfield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: _('Zoom'),
                            inputValue: 'zoom',
                            name: 'afterSelectionAction',
                            checked: true
                        }, {
                            boxLabel: _('Centra'),
                            name: 'afterSelectionAction',
                            inputValue: 'center'
                        }, {
                            boxLabel: _('Nessuna'),
                            name: 'afterSelectionAction',
                            inputValue: 'none'
                        }
                    ]
                }, {
                    xtype: 'checkboxgroup',
                    layout: 'vbox',
                    items: [
                        {
                            boxLabel: _('Limita alla vista corrente'),
                            id: 'limit_to_extent',
                            name: 'limit_to_extent'
                        }, {
                            boxLabel: _('Visualizza risultati su mappa'),
                            id: 'searchForm_display_features',
                            checked: true,
                            name: 'display_features'
                        }
                    ]
                }
            ]
        }];
        
        me.buttons = [{
            text: _('Cerca'),
            r3action: 'searchbutton',
            handler: function() {
                me.handleSearch();
            }
        },{
            text: _('Deseleziona tutti'),
            handler: function(button) {
                me.fireEvent('unselectall', button);
            }
        }];

        me.callParent(arguments);
    },
    
    handleSearch: function(button) {
        var me = this,
            searchFields = this.query('field[r3role="searchfield"]'),
            len = searchFields.length,
            searchField,
            query,
            options = me.getSearchOptions();
            
        if(!me.selectedSearch) return;
            
        query = {
            typeName: me.selectedSearch.get('name'),
            criteria: []
        };
        
        for(var i = 0; i < len; i++) {
            searchField = searchFields[i];
            
            if(!searchField.getValue()) continue;
            
            query.criteria.push({
                type: 'comparison',
                property: searchField.getName(),
                operator: searchField.operator,
                value: searchField.getValue()
            });
        }
            
        me.fireEvent('search', [query], options);
    },
    
    getSearchOptions: function() {
        var options = {},
            optionFields = this.query('[r3role="optionfield"]'),
            len = optionFields.length,
            optionField, value;
            
        for(var i = 0; i < len; i++) {
            optionField = optionFields[i];
            value = optionField.getValue();
            if(!value) continue;
            if(typeof(value) == 'object') {
                value = value[optionField.getName()];
            } else {
                value = value;
            }
            options[optionField.getName()] = value;
        }
            
        return options;
    },
    
    changeForm: function(record) {
        var fieldset = this.down('fieldset[r3role="searchfields"]'),
            fields = record.get('searchfields'),
            len = fields.length,
            items = [],
            field;

        this.selectedSearch = record;
        
        for(var i = 0; i < len; i++) {
            field = fields[i];
            items.push(this.getField(field));
        }
        
        fieldset.suspendLayouts();
        fieldset.removeAll();
        fieldset.add(items);
        fieldset.resumeLayouts(true);
    },
    
    getField: function(fieldConfig) {
        Ext.apply(fieldConfig, {
            r3role: 'searchfield'
        });
        return fieldConfig;
    },
    
    
    getFields: function() {
    /*
    
        {
            xtype: 'combobox',
            fieldLabel: 'Via',
            hideTrigger: true
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: 'Numero',
            layout: 'hbox',
            fieldDefaults: {
                labelAlign: 'top'
            },
            items: [{
                xtype: 'combobox',
                width: 50,
                queryMode: 'local',
                displayField: 'opt_prt',
                matchFieldWidth: false
            }, {
                xtype: 'numberfield',
                width: 50,
                hideTrigger: true,
                margins: '0 0 0 5'
            }]
        }, {
            xtype: 'textfield',
            fieldLabel: 'Testo',
            labelAlign: 'top',
            margins: '0'
        }, {
            xtype: 'datefield',
            fieldLabel: 'Data',
            labelAlign: 'top',
            margins: '0'
            
        }, {
            xtype: 'fieldcontainer',
            defaultType: 'radiofield',
            defaults: {
                flex: 1
            },
            layout: 'vbox',
            items: [
                {
                    boxLabel: 'Soddisfa tutti i criteri',
                    name: 'searchForm_logical'
                }, {
                    boxLabel: 'Soddisfa almeno un criterio',
                    name: 'searchForm_logical'
                }
            ]
        }
    */
    }
    
});


