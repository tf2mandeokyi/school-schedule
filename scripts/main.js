/**
 * @typedef {Object} Subject
 * @property {string?} name - The name of the subject.
 * @property {string?} short_name - The name of the subject, but in short version.
 * @property {string?} zoom_link - The zoom link to that subject.
 * @property {string?} wedorang_link - The wedorang link to that subject.
 */



/**
 * Returns hours and minutes combined in minutes.
 */
Date.prototype.getHourMinute = function() {
    return this.getHours() * 60 + this.getMinutes();
}



const ClassSchedule = {};



/**
 * Subject map.
 * @type {Object<string, Subject>}
 */
ClassSchedule.subjects = {};



/**
 * Weekly schedule.
 * @type {string[][]}
 */
ClassSchedule.schedule = [];



/**@type {{dotw: number | undefined, y: number | undefined}}*/
ClassSchedule.selector = {dotw: undefined, y: undefined};



ClassSchedule.getVariablesFromDate = function(/** @type {Date} */date=new Date()) {
    return {
        index: this.getIndexFromTime(date),
        dotw: date.getDay(),
        /** @type {number} */
        hour_minute: date.getHourMinute()
    }
}



/**@return {Promise<void>}*/
ClassSchedule.fetchTable = async function(
        /** @type {string} */schoolName, 
        /** @type {string} */semester, 
        /** @type {string} */grade, 
        /** @type {string} */class_name) {

    const parent = this;

    return new Promise(async (res, rej) => {
        /**@type {Response}*/
        let response;
        try {
            response = await fetch(`./data/${schoolName}/${semester}/${grade}/${class_name}.json`);
        } catch(e) {
            rej(e); return;
        }
        const data = response.json();
        parent.subjects = data['subject'];
        parent.schedule = data['schedule'];
        res();
    })
}



ClassSchedule.initializeTable = function() {
    $('#table').html('<tr>' + ['월', '화', '수', '목', '금'].map((str, idx) => `<td class="dotw">${str}</td>`) + '</tr>');
    for(let y = 0; y < this.schedule[0].length; y++) {
        let day_string = this.schedule.map((arr, dotw) => {
            if(this.subjects[arr[y]] === undefined) return '<td></td>'
            let {name, short_name} = this.subjects[arr[y]];
            return `
                <td class="subject-td" id="time_td_${dotw}_${y}" time="${dotw},${y}" subject="${arr[y]}">
                    <div class="subject">${short_name !== undefined ? short_name : name !== undefined ? name : ''}</div>
                </td>`;
        }).reduce((prev, curr) => prev + curr, '');
        $('#table').append(`<tr>${day_string}</tr>`);
    }
}



ClassSchedule.refreshTable = function(/**@type {Date}*/ date=new Date()) {
    let {dotw: current_dotw, hour_minute: current_hm} = this.getVariablesFromDate(date);

    for(let y = 0; y < this.schedule[0].length; y++) {
        
        let start_time = time_length.start + time_length.break + y * (time_length.class + time_length.break) + (y > time_length.lunch_time_index-1 ? time_length.lunch : 0);
        let end_time = start_time + time_length.class;

        this.schedule.forEach((arr, dotw) => {
            if(this.subjects[arr[y]] === undefined) return;

            let subject_time_status = '';
            if(current_dotw > dotw+1 || (current_dotw === dotw+1 && current_hm >= end_time)) subject_time_status = 'done-subject';
            else if(current_dotw === dotw+1 && start_time <= current_hm && current_hm < end_time) subject_time_status = 'doing-subject';
            if(this.selector.dotw === dotw && this.selector.y === y) subject_time_status += ' selected-subject';

            $(`#time_td_${dotw}_${y}`).attr('class', `subject-td ${subject_time_status}`);
        });
    }
}



ClassSchedule.getIndexFromTime = function(/**@type {Date}*/ date=new Date()) {
    let current_hm = date.getHourMinute() - time_length.start;
    let lunch_start = time_length.lunch_time_index * (time_length.class + time_length.break);
    let index = Math.floor(
        (current_hm < (lunch_start + time_length.lunch) ? current_hm : current_hm - time_length.lunch) / (time_length.class + time_length.break)
    );
    return index;
}



ClassSchedule.getStartTimeFromIndex = function(/**@type {number}*/ index) {
    return time_length.start + time_length.break + (time_length.class + time_length.break) * index +
        (index >= time_length.lunch_time_index ? time_length.lunch : 0);
}



ClassSchedule.refreshCurrentSubject = function(/**@type {Date}*/ date) {

    if(this.selector.dotw !== undefined && this.selector.y !== undefined) return;
    let {index, dotw: current_dotw, hour_minute: current_hm} = this.getVariablesFromDate(date);

    if(current_dotw === 0 || current_dotw === 6) { // Weekends
        this.setMessage('weekend'); return;
    }
    if(current_hm < time_length.morning_start) { // Early mornings
        this.setMessage('early_morning'); return;
    }
    if(current_hm >= time_length.morning_start && current_hm < time_length.morning_end) { // Morning
        this.setMessage('morning'); return;
    }

    current_hm -= time_length.start;
    let lunch_start = time_length.lunch_time_index * (time_length.class + time_length.break);
    let subject = this.subjects[this.schedule[current_dotw-1][index]];
    
    if(lunch_start <= current_hm && current_hm < lunch_start + time_length.lunch) { // Lunch time
        this.setMessage('lunch');
    }
    else { // Not lunch time
        if(current_hm >= (lunch_start + time_length.lunch)) current_hm -= time_length.lunch;
        if(index >= this.schedule[current_dotw-1].length) {
            this.setMessage('done');
        }
        else if(current_hm % (time_length.class + time_length.break) < time_length.break) { // Break time
            this.setMessage('break', subject);
        }
        else { // Class time
            this.setMessage('class', subject);
        }
    }
}



/**
 * 
 * @param {('class'|'break'|'lunch'|'morning'|'early_morning'|'done'|'weekend')} type - The type of the message.
 * @param {Subject} subject 
 */
ClassSchedule.setMessage = function(type, subject) {
    switch(type) {
        case 'weekend':
            $('#subject-message').html('오늘은 주말입니다.');
            this.setDirectLinks(this.subjects[''], true);
            break;
        case 'done':
            $('#subject-message').html('오늘 수업은 다 끝났습니다.');
            this.setDirectLinks(this.subjects[''], true);
            break;
        case 'break':
            $('#subject-message').html(
                `지금은 <span class="current-subject">쉬는시간</span>입니다.<br>` +
                `<span class="subject-submessage">다음 과목: ${subject.name}</span>`
            );
            this.setDirectLinks(subject);
            break;
        case 'class':
            $('#subject-message').html(`현재 과목은 <span class="current-subject">${subject.name}</span>입니다.`);
            this.setDirectLinks(subject);
            break;
        case 'lunch':
            $('#subject-message').html(`지금은 <span class="current-subject">점심시간</span>입니다.`);
            this.setDirectLinks(this.subjects[''], true);
            break;
        case 'early_morning':
            $('#subject-message').html(`아직은 아침 조회 시간이 아닙니다.`);
            this.setDirectLinks(this.subjects[''], true);
            break;
        case 'morning':
            $('#subject-message').html(`지금은 <span class="current-subject">아침 조회 시간</span>입니다.`);
            this.setDirectLinks(this.subjects['morning']);
            break;
    }
}



ClassSchedule.refreshContents = function(/**@type {Date}*/ date=new Date()) {
    ClassSchedule.updateSelectedSubject(date);
    ClassSchedule.refreshTable(date);
    ClassSchedule.refreshCurrentSubject(date);
    $('.time').text(
        `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}) ` +
        `${('00' + date.getHours()).slice(-2)}:${('00' + date.getMinutes()).slice(-2)}:${('00' + date.getSeconds()).slice(-2)}`
    );
}



ClassSchedule.interval_check_prev_second = -1;
ClassSchedule.refreshWithInterval = function(/**@type {Date}*/ date=new Date()) {
    if(this.interval_check_prev_second !== date.getSeconds()) {
        this.refreshContents(date);
        this.interval_check_prev_second = date.getSeconds();
    }
}



/**
 * @param {Subject} subject - Subject object.
 * @param {boolean} hide_zoom - Set this to true if zoom button should be hidden when unavailable.
 */
ClassSchedule.setDirectLinks = function({zoom_link, wedorang_link, wedorang_name, zoom_name}, hide_zoom=false) {
    let zoom_button = $('#zoom-button'), wedorang_button = $('#wedorang-button');
    if(!wedorang_link) {
        wedorang_button.hide();
    }
    else {
        wedorang_button.text(`${!!wedorang_name ? wedorang_name + ' ' : ''}위두랑으로 가기`);
        wedorang_button.attr('href', wedorang_link);
        wedorang_button.show();
    }
    if(!zoom_link) {
        if(hide_zoom) {
            zoom_button.hide();
        }
        else {
            zoom_button.show();
            zoom_button.addClass('no-zoom-link');
            zoom_button.text('고정된 Zoom 링크가 없습니다.');
            zoom_button.attr('href', '');
        }
    }
    else {
        zoom_button.show();
        zoom_button.text(`${!!zoom_name ? zoom_name + ' ' : ''}Zoom 참여하러 가기`);
        zoom_button.removeClass('no-zoom-link');
        zoom_button.attr('href', zoom_link);
    }
}



ClassSchedule.updateSelectedSubject = function(/**@type {Date}*/date=new Date()) {
    if(this.selector.dotw !== undefined && this.selector.y !== undefined) {

        let {index: current_index, dotw: current_dotw, hour_minute: current_hm} = this.getVariablesFromDate(date);

        let subject = this.subjects[this.schedule[this.selector.dotw][this.selector.y]];

        if(current_dotw-1 === this.selector.dotw) {
            if(this.selector.y === current_index) {
                let lunch_start = time_length.lunch_time_index * (time_length.class + time_length.break) + time_length.start;
                let start_time = this.getStartTimeFromIndex(current_index);
                if(current_hm >= lunch_start && current_hm < lunch_start + time_length.lunch) {
                    this.displayTimeLeft(subject.name, this.getStartTimeFromIndex(this.selector.y) - current_hm);
                }
                else if(current_hm < start_time) {
                    this.displayTimeLeft(subject.name, this.getStartTimeFromIndex(this.selector.y) - current_hm);
                }
                else {
                    ClassSchedule.selector = {dotw: undefined, y: undefined};
                    $('#go-back').hide();
                    return;
                }
            }
            else if(this.selector.y < current_index) {
                $('#subject-message').html(`선택한 과목 <span class="current-subject">${subject.name}</span>까지 1주일 남았습니다.`);
            }
            else {
                this.displayTimeLeft(subject.name, this.getStartTimeFromIndex(this.selector.y) - current_hm);
            }
        }
        else {
            let delta = (((this.selector.dotw - current_dotw + 1) % 7) + 7) % 7;
            $('#subject-message').html(`선택한 과목 <span class="current-subject">${subject.name}</span>까지 ${delta}일 남았습니다.`);
        }
        this.setDirectLinks(subject);
        $('#go-back').show();
    }
    else {
        $('#go-back').hide();
    }
}



/**
 * @param {string} name - The name of the subject.
 * @param {number} delta - The value of the time left until the subject is started
 */
ClassSchedule.displayTimeLeft = function(name, delta) {
    $('#subject-message').html(
        `선택한 과목 <span class="current-subject">${name}</span>까지 ` +
        `${Math.floor(delta / 60) == 0 ? '' : Math.floor(delta / 60) + '시간 '}${delta % 60 == 0 ? '' : delta % 60 + '분 '}남았습니다.`
    );
}



const checkDarkTheme = function() {
    let mode = localStorage.getItem('dark-mode');
    if(mode === 'true') {
        $('html').addClass('dark-theme');
        $('#dark-light-icon').attr('class', 'fas fa-moon');
        $('.dark-light-tooltiptext').text('클릭하시면 밝은 모드로 전환됩니다.');
    } else {
        $('html').removeClass('dark-theme');
        $('#dark-light-icon').attr('class', 'fas fa-sun');
        $('.dark-light-tooltiptext').text('클릭하시면 어두운 모드로 전환됩니다.');
    }
};



(function() {
    if(localStorage.getItem('dark-mode') === null) {
        localStorage.setItem('dark-mode', true);
    }
})();



$(function() {

    ClassSchedule.fetchTable('과천중앙고', '1', '2', '1').then(() => {
        ClassSchedule.initializeTable();
        ClassSchedule.refreshContents();
        window.tablerefresh = setInterval(() => ClassSchedule.refreshWithInterval(), 66);
        checkDarkTheme();
    
        $('.go-to-button').click(function() {
            if($(this).attr('href') === '') return;
            window.open($(this).attr('href'), '_blank');
        });
    
        $('.subject-td').click(function() {
            let time_arr = $(this).attr('time').split(',');
            let dotw = parseInt(time_arr[0]), index = parseInt(time_arr[1]);
    
            ClassSchedule.selector = {dotw: dotw, y: index};
            ClassSchedule.refreshContents();
        });
    
        $('#go-back').click(function() {
            ClassSchedule.selector = {dotw: undefined, y: undefined};
            ClassSchedule.refreshContents();
        });
    
        $('.dark-light-button').click(() => {
            localStorage.setItem('dark-mode', localStorage.getItem('dark-mode') === 'true' ? 'false' : 'true');
            checkDarkTheme();
        });
    }).catch(e => {
        console.error(e);
    })
    
});