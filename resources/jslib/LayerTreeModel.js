/**
 * Extended Model for trees that use GeoExt tree components. 
 * 
 *
 * This model adds several fields that are specific to tree extensions
 * provided by the Map:
 *
 * * **plugins** Object[]: The plugins for this node.
 * * **layer** OpenLayers.Layer: The layer this node is connected to.
 * * **container** Ext.AbstractPlugin: The instance of a container plugin.
 *   Read only.
 * * **checkedGroup** String: An identifier for a group of mutually exclusive
 *   layers. If set, the node will render with a radio button instead of a
 *   checkbox.
 * * **fixedText** Boolean: Used to determine if a node's name should change.
 *   dynamically if the name of the connected layer changes, if any. Read only.
 * * **component** Ext.Component: The component to be rendered with this node,
 *   if any.
 *
 */
Ext.define('Map.LayerTreeModel',{
    extend: 'GeoExt.data.LayerTreeModel',
    alias: 'model.layertree',
    fields: [  
        {name: 'text', type: 'string'}, 
        {name: 'plugins'},
        {name: 'layer'},
        {name: 'container'},
        {name: 'checkedGroup', type: 'string'},
        {name: 'fixedText', type: 'bool'},
        {name: 'component'},
        {name: 'disabled', type: 'bool'},
        {name: 'displayInLayerSwitcher', type: 'bool'}
    ]
});