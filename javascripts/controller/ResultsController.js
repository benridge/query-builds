Ext.define('rlm.controller.ResultsController', {
    
    START_HOUR: 6,
    END_HOUR: 18,

    updateResults: function(builds, resultsDisplay) {
        var results = this._calculate(builds);
        resultsDisplay.update(results);
    },
    
    _calculate: function(builds) {
        var previousBuild,
            previousBuildState,
            currentBuildState,
            diffDuringWorkHours,
            previousDate,
            workingDayCount = 0,
            analyzedBuildCount = 0,
            buildTime = 0,
            buildTimeCount = 0,
            greenTime = 0,
            redTime = 0;

        Ext.Array.each(builds, function(currentBuild) {
            if (!this._shouldAnalyzeBuild(currentBuild)) {
                return;
            }
            analyzedBuildCount++;

            if (currentBuild.get('Status') !== "UNKNOWN") {
                buildTimeCount++;
                buildTime += this._getBuildTimeMillis(currentBuild);
            }

            diffDuringWorkHours = this._getTimeDiffDuringWorkHours(currentBuild, previousBuild);
            previousBuildState = previousBuild ? this._getStatus(previousBuild) : null;
            currentBuildState = this._getStatus(currentBuild);

            var currentEndDate = new Date(this._getEndDateMillis(currentBuild)),
                previousEndDate = new Date(this._getEndDateMillis(previousBuild)),
                currentDate = new Date(this._getStartTime(currentBuild)).getDate();

            if (!this._isSameDay(currentEndDate, previousEndDate) &&
                    this._isDateAWorkingDay(currentEndDate)) {
                workingDayCount++;
            }

            if (currentBuildState !== previousBuildState) {
                if (currentBuildState === 'SUCCESS') {
                    redTime += diffDuringWorkHours;
                } else if (previousBuildState === 'SUCCESS') { //don't count non-green colors
                    greenTime += diffDuringWorkHours;
                } else {
                }
            } else if (currentBuildState === 'SUCCESS') {
                greenTime += diffDuringWorkHours;
            }
            else {
                redTime += diffDuringWorkHours;
            }

            previousBuild = currentBuild;
            previousDate = currentDate;
            }, this
        );

        var totalTime = greenTime + redTime;

        if (analyzedBuildCount === 0) {
            return {
                errorMessage: "No Builds found for Build Definition."
            };
        }

        return {
            countingToday: new Date().getHours() < this.END_HOUR,
            avgBuildTime: this._showHoursMinutesSeconds(buildTime/buildTimeCount),
            avgGreenLightTime: this._showHoursMinutesSeconds(greenTime/workingDayCount),
            avgGreenLightPercent: Number(greenTime/totalTime * 100).toFixed(2) + "%",
            avgRedLightTime: this._showHoursMinutesSeconds(redTime/workingDayCount),
            avgRedLightPercent: Number(redTime/totalTime * 100).toFixed(2) + "%",
            numberOfBuilds: analyzedBuildCount,
            numberOfWorkingDays: workingDayCount,
            totalGreenLightTime: this._showHoursMinutesSeconds(greenTime),
            totalRedLightTime: this._showHoursMinutesSeconds(redTime)
        };
    },


    _getTimeDiffDuringWorkHours: function(currentBuild, previousBuild) {
        var currentBuildEndDateMillis = this._getEndDateMillis(currentBuild),
            previousBuildEndDateMillis;

        //first build, we can't determine so throw it out
        if (!previousBuild) {
            return 0;
        }

        previousBuildEndDateMillis = this._getEndDateMillis(previousBuild);

        //working hours
        if (this._isSpanDuringWorkingHours(currentBuildEndDateMillis, previousBuildEndDateMillis)) {
            return currentBuildEndDateMillis - previousBuildEndDateMillis;
        }

        //span straddles working hours
        if (!this._isSameDay(currentBuildEndDateMillis, previousBuildEndDateMillis)) {
            return this._handleMultiDaySpan(currentBuild, previousBuild);
        }
        if (!this._isTimeWithinWorkingHours(previousBuildEndDateMillis) && this._isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            return currentBuildEndDateMillis  - this._getWorkingDayStartInMillis(currentBuild);
        } else if (this._isTimeWithinWorkingHours(previousBuildEndDateMillis) && !this._isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            return this._getWorkingDayEndInMillis(currentBuild) - previousBuildEndDateMillis;
        } else {
            return 0;  //outside working hours
        }
    },

    _handleMultiDaySpan: function(currentBuild, previousBuild) {
        var total = 0,
            previousBuildEndDateMillis = this._getEndDateMillis(previousBuild),
            currentBuildEndDateMillis = this._getEndDateMillis(currentBuild);

        if (this._isTimeWithinWorkingHours(previousBuildEndDateMillis)) {
            total += this._getWorkingDayEndInMillis(previousBuild) - previousBuildEndDateMillis;
        }
        if (this._isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            total += currentBuildEndDateMillis - this._getWorkingDayStartInMillis(currentBuild);
        }
        return total;
    },

    _isSpanDuringWorkingHours: function(currentBuildEndDateMillis, previousBuildEndDateMillis) {
        return this._isSameDay(currentBuildEndDateMillis, previousBuildEndDateMillis)
                && this._isTimeWithinWorkingHours(currentBuildEndDateMillis)
                && this._isTimeWithinWorkingHours(previousBuildEndDateMillis);
    },

    _isSameDay: function(date1Millis, date2Millis) {
        var date1 = new Date(date1Millis),
            date2 = new Date(date2Millis);

        return date1.getYear() === date2.getYear()
                && date1.getMonth() === date2.getMonth()
                && date1.getDate() === date2.getDate();
    },

    _isTimeWithinWorkingHours: function(dateMillis) {
        var date = new Date(dateMillis),
            hour = date.getHours();

        if (this._isDateAWorkingDay(date)) //during weekday
	        // 6:00 AM to 5:59:59 PM
	        return hour >= this.START_HOUR && hour < this.END_HOUR;

	 	return false;
    },

    _isDateAWorkingDay: function(date) {
        var day = date.getDay();
        return [1,2,3,4,5].indexOf(day) !== -1;
    },

    _getWorkingDayStartInMillis: function(build) {
        var date = new moment(this._getStartTime(build));
        date.hour(this.START_HOUR);
        date.minute(0);
        date.second(0);

        return date.toDate().getTime();
    },

    _getWorkingDayEndInMillis: function(build) {
        var date = new moment(this._getStartTime(build));
        date.hour(this.END_HOUR);
        date.minute(0);
        date.second(0);

        return date.toDate().getTime();
    },

    _getEndDateMillis: function(build) {
        if (build) {
            return this._getEndTime(build);
        }
    },

    _getStatus: function(build) {
        if (build) {
            var state = build.get('Status');
            if (state === 'SUCCESS') {
                return 'SUCCESS';
            }
            return 'FAILING';
        }
    },

    /**
     * Don't analyze build if build is on the same day as today and today is not yet done.
     * @param currentBuild
     * @return {boolean}
     */
    _shouldAnalyzeBuild: function(currentBuild) {
        var now = new Date(),
            currentHour = now.getHours();

        return !this._isSameDay(now.getTime(), this._getStartTime(currentBuild))
                || currentHour >= this.END_HOUR;
    },

    _getBuildTimeMillis: function(build) {
        return build.get('Duration') * 1000;
    },
    
    _getStartTime: function(build) {
        var buildTime = Date.parse(build.get('Start')),
            timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        return buildTime + timeZoneOffset;
    },

    _getEndTime: function(build) {
        return this._getStartTime(build) + (build.get('Duration') * 1000);
    },

    _showHoursMinutesSeconds: function(diff) {
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor(diff / (1000 * 60)) % 60;
        var seconds = Math.floor(diff / 1000) % 60;
        var result = '';
        result += (hours > 0) ? this._pluralize('hour', hours) + ", " : "";
        result += (minutes > 0) ? this._pluralize('minute', minutes) : "";
        result += (seconds > 0) ? this._pluralize('second', seconds) : "";
        return result;
    },

    _pluralize: function(val, num) {
        if(num != 1) { val += 's'; }
        return ' ' + num + ' ' + val;
    }

});