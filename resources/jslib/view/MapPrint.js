Ext.define('Map.view.MapPrint', {
    extend: 'Ext.window.Window',
    alias: 'widget.mapprint',
    title: _('Impostazioni stampa'),
    
    layout: 'vbox',
    width: 350,
    bodyPadding: 5,
    autoShow: true,
    
    initComponent: function() {
        var me = this;
        
        var pageformat = Ext.create('Ext.data.Store', {
            fields: ['format'],
            data : [
                {'format':'A4'},
                {'format':'A3'}
            ]
        });

        var resolution = Ext.create('Ext.data.Store', {
            fields: ['resolution'],
            data : [
                {'resolution':'Media'},
                {'resolution':'Alta'}
            ]
        });
        
        
        me.items = [{
            xtype: 'fieldset',
            width: '100%',
            defaults: {
                labelAlign: 'right',
                labelWidth: 80
            },
            title: _('Intestazioni stampa'),
            items: [{
                xtype: 'textarea',
                width: 305,
                fieldLabel: _('Testo'),
                name: 'print_text'
            }, {
                xtype: 'datefield',
                fieldLabel: _('Data'),
                width: 200,
                name: 'print_date' 
            }]
        }, {
            xtype: 'fieldset',
            width: '100%',
            defaults: {
                labelAlign: 'right',
                labelWidth: 125
            },
            title: _('Proprietà di stampa'),
            items: [{
                xtype: 'radiogroup',
                fieldLabel: _('Legenda'),
                items: [{
                    boxLabel: _('Si'),
                    name: 'print_legend'
                }, {
                    boxLabel: _('No'),
                    name: 'print_legend',
                    checked: true
                }]
            }, {
                xtype: 'radiogroup',
                fieldLabel: _('Layout di stampa'),
                layout: 'vbox',
                items: [{
                    boxLabel: _('Verticale'),
                    name: 'page_direction',
                    checked: true
                }, {
                    boxLabel: _('Orizzontale'),
                    name: 'page_direction'
                }]
            }, {
                xtype: 'combobox',
                fieldLabel: 'Formato di stampa',
                name: 'format_size',
                value: 'A4',
                store: pageformat,
                queryMode: 'local',
                displayField: 'format',
                width: 200
            }, {
                xtype: 'radiogroup',
                fieldLabel: 'Formato',
                items: [{
                    boxLabel: 'HTML',
                    name: 'format_extension',
                    checked: true
                }, {
                    boxLabel: 'PDF',
                    name: 'format_extension'
                }]
            }]
        }, {
            xtype: 'fieldset',
            title: 'Opzioni',
            width: '100%',
            defaults: {
                labelAlign: 'right',
                labelWidth: 80
            },
            items: [{
                xtype: 'fieldcontainer',
                fieldLabel: 'Scala',
                layout: 'vbox',
                items: [{
                    xtype: 'radio',
                    boxLabel: 'Auto',
                    name: 'scale_mode',
                    checked: true
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    width: '100%',
                    items: [{
                        xtype: 'radio',
                        boxLabel: '1:',
                        name: 'scale_mode',
                        handler: function(me, checked){
                            var fieldset = me.ownerCt;
                            fieldset.down('button[name="show_box"]').setDisabled(!checked);
                            fieldset.down('textfield[name="scale_textfield"]').setDisabled(!checked);
                        }
                    }, {
                        xtype: 'textfield',
                        hideLabel: true,
                        name: 'scale_textfield',
                        value: '100.000',
                        width: 100,
                        margin: '0 0 0 5px',
                        disabled: true
                    }, {
                        xtype: 'button',
                        name: 'show_box',
                        tooltip: _('Seleziona box da area'),
                        iconCls: 'silk-box_map',
                        disabled: true,
                        enableToggle: true,
                        listeners: {
                            toggle: function(btn, toggle, fn) {
                                if(toggle == true) {
                                    btn.setIconCls('silk-box_map_remove');
                                    btn.setTooltip(_('Rimuovi box'));
                                } else {
                                    btn.setIconCls('silk-box_map');
                                    btn.setTooltip(_('Seleziona box da area'));
                                }
                            }
                        }
                        
                    }]
                }]
            }, {
                xtype: 'combobox',
                width: 200,
                store: resolution,
                queryMode: 'local',
                value: 'Media',
                name: 'print_dpi',
                displayField: 'resolution',
                fieldLabel: 'Risoluzione'
            }]
        }];
        me.buttons = [{text: 'Stampa'}];
        
        me.callParent(arguments);
    }
});