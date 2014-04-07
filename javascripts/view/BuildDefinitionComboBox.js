Ext.define('rlm.view.BuildDefinitionComboBox', {
    extend: 'Rally.ui.combobox.ComboBox',
    alias: 'widget.builddefinitioncombobox',
    config: {
        fieldLabel: 'Build:',
        minChars: 0,
        defaultSelectionPosition: 'none',
        editable: true,
        queryParam: 'ignoreThisParam',
        autoSelect: false,
        value: '/builddefinition/14104398785',
        storeConfig: {
            model: 'BuildDefinition',
            autoLoad: true,
            context: {
                project: null
            }
        },
        listConfig: {
            loadMask: true,
            deferEmptyText: true,
            cls: 'builddefinition-list'
        }
    },

    constructor: function(config) {
        this.config.storeConfig.filters = [this._addLatestFilter()];
        this.callParent(arguments);
    },

    doQuery: function(queryString, forceAll, rawQuery) {
        var store = this.getStore();

        store.filters.clear();
        store.filters.add(this._addLatestFilter());

        if (!Ext.isEmpty(queryString)) {
            store.filters.add(Ext.create('Rally.data.wsapi.Filter', {
                property: 'Name',
                operator: 'contains',
                value: queryString
            }));
        }

        this.callParent([queryString, forceAll, rawQuery]);
    },

    _addLatestFilter: function() {
        return Ext.create('Rally.data.wsapi.Filter', {
            property: 'LastBuild.Start',
            operator: '>',
            value: new moment().subtract('days', 30).format('YYYY-MM-DD')
        });
    }

});