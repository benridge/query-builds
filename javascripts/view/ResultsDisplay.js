Ext.define('rlm.view.ResultsDisplay', {
    extend: 'Ext.Component',
    alias: 'widget.rlmresultsdisplay',
    cls: 'results-display',

    tpl: [
        '<tpl if="(!values.errorMessage)">',
            '<div class="title">Average per working day 6AM - 6PM Mountain Time</div>',
            '<div class="row"><span class="label">Build Time:</span><span class="value">{avgBuildTime}</span></div>',
            '<div class="row"><span class="label">Green light:</span><span class="value"><span class="percent">{avgGreenLightPercent}</span>  ({avgGreenLightTime})  </span></div>',
            '<div class="row"><span class="label">Red light:</span><span class="value"><span class="percent">{avgRedLightPercent}</span> ({avgRedLightTime})</span></div>',
            '<div class="title">Total data</div>',
            '<div class="row"><span class="label">Number of builds:</span><span class="value">{numberOfBuilds}</span></div>',
            '<div class="row"><span class="label">Number of working days:</span><span class="value">{numberOfWorkingDays}</span></div>',
            '<div class="row"><span class="label">Green light time:</span><span class="value">{totalGreenLightTime}</span></div>',
            '<div class="row"><span class="label">Red light time:</span><span class="value">{totalRedLightTime}</span></div>',
        '</tpl>',
        '<tpl if="(values.errorMessage)">',
            '<div class="title">{errorMessage}</div>',
        '</tpl>'
    ],

    _mask: undefined,

    showMask: function() {
        if (!this._mask) {
            this._mask = new Ext.LoadMask(this);
        }
        this._mask.show();
    },

    hideMask: function() {
        if (this._mask) {
            this._mask.hide();
        }
    }
});