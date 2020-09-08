/**
 * @typedef {Object} Subject
 * @property {string?} name - The name of the subject.
 * @property {string?} short_name - The name of the subject, but in short version.
 * @property {string?} zoom_link - The zoom link to that subject.
 * @property {string?} wedorang_link - The wedorang link to that subject.
 */

/**
 * Subject map.
 * @type {Object<string, Subject>}
 */
const subjects = {
    '': {name: undefined},
    'morning': {
        name: '아침조회',
        zoom_link: 'https://zoom.us/j/5397038425?pwd=VzFFM2xGWlhreit3czZXb3Bhejh5Zz09',
        wedorang_link: undefined
    },
    'korean_a': {
        name: '국어A',
        zoom_link: 'https://us02web.zoom.us/j/7820474556?pwd=bHJiQW44QUNZTjV5ZUp3UzhSN0xGUT09',
        wedorang_link: 'http://rang.edunet.net/class/G000341088/index.do'
    },
    'korean_b': {
        name: '국어B',
        zoom_link: 'https://us02web.zoom.us/j/2439618049?pwd=N2ppWTNlUXpIY1EwemI5OGFHQjNvZz09',
        wedorang_link: 'http://rang.edunet.net/class/G000341088/index.do'
    },
    'english': {
        name: '영어',
        zoom_link: 'https://zoom.us/j/4313083494?pwd=Q3d6dUVJMEJsd2lUTy9LY2wwbURnZz09',
        wedorang_link: 'http://rang.edunet.net/class/G000341387/index.do'
    },
    'history': {
        name: '한국사',
        zoom_link: 'https://zoom.us/j/6700371524?pwd=R1h2RHlFaGVyNk94S1hTcFNlWEczdz09',
        wedorang_link: 'http://rang.edunet.net/class/G000343437/index.do'
    },
    'math': {
        name: '수학',
        zoom_link: 'https://us02web.zoom.us/j/7708140017?pwd=TVlOSUJIUldFbUNkRlc4QkFDSjdudz09',
        wedorang_link: 'http://rang.edunet.net/class/G000340371/index.do'
    },
    'social': {
        name: '통합사회',
        short_name: '통사',
        zoom_link: 'https://us02web.zoom.us/j/2535430699?pwd=MmxEYnFsT0ZKUHZrUUp4bEhRanl4UT09',
        wedorang_link: 'http://rang.edunet.net/class/G000340788/index.do'
    },
    'science_a': {
        name: '통합과학A',
        short_name: '통과A',
        zoom_link: 'https://us02web.zoom.us/j/3699834810?pwd=ZU1qSm1BdnJJS0RUWUNCZEprQW1vZz09',
        wedorang_link: 'http://rang.edunet.net/class/G000343648/index.do'
    },
    'science_b': {
        name: '통합과학B',
        short_name: '통과B',
        zoom_link: 'https://zoom.us/j/5397038425?pwd=VzFFM2xGWlhreit3czZXb3Bhejh5Zz09',
        wedorang_link: 'http://rang.edunet.net/class/G000343648/index.do'
    },
    'tech': {
        name: '기술가정',
        short_name: '기가',
        zoom_link: 'https://zoom.us/j/8545161824?pwd=eWZ6WHZhakdCeHp3aFo4Z0xVWkxZQT09',
        wedorang_link: 'http://rang.edunet.net/class/G001279722/index.do'
    },
    'pe': {
        name: '체육',
        zoom_link: 'https://zoom.us/j/5013245440?pwd=a3VqR2FKU1hkdDJVSXFDYVpMM3NlQT09',
        wedorang_link: 'http://rang.edunet.net/class/G000340838/index.do'
    },
    'career': {
        name: '진로',
        wedorang_link: 'http://rang.edunet.net/class/G000571230/index.do'
    },
    'sci_experim': {
        name: '과학탐구실험',
        short_name: '과탐실',
        wedorang_link: 'http://rang.edunet.net/class/G000341135/index.do'
    },
    'art': {
        name: '미술',
        wedorang_link: 'http://rang.edunet.net/class/G000341036/index.do'
    },
    'etc': {
        name: '창체'
    }
};

/**
 * Weekly schedule.
 * @type {string[][]}
 */
const schedule = [
    ['art', 'art', 'social', 'math', 'korean_a', 'tech', 'english'],
    ['math', 'pe', 'career', 'history', 'korean_a', 'science_a', 'social'],
    ['science_b', 'math', 'social', 'korean_b', 'english', 'history'],
    ['korean_b', 'english', 'history', 'tech', 'pe', 'math', 'science_b'],
    ['science_a', 'tech', 'english', 'sci_experim', 'etc', 'etc', 'etc'],
];

const time_length = {
    morning_start: 8 * 60 + 50,
    start: 9 * 60,
    class: 50,
    break: 10,
    lunch_time_index: 4,
    lunch: 50
}

const ClassSchedule = {};

/**@type {{dotw: number | undefined, y: number | undefined}}*/
ClassSchedule.selector = {dotw: undefined, y: undefined};

/**
 * Returns hours and minutes combined in minutes.
 */
Date.prototype.getHourMinute = function() {
    return this.getHours() * 60 + this.getMinutes();
}

ClassSchedule.initializeTable = function() {
    $('#table').html('<tr>' + ['월', '화', '수', '목', '금'].map((str, idx) => `<td class="dotw">${str}</td>`) + '</tr>');
    for(let y = 0; y < schedule[0].length; y++) {
        let day_string = schedule.map((arr, dotw) => {
            if(subjects[arr[y]] === undefined) return '<td></td>'
            let {name, short_name} = subjects[arr[y]];
            return `
                <td class="subject-td" id="time_td_${dotw}_${y}" time="${dotw},${y}" subject="${arr[y]}">
                    <div class="subject">${short_name !== undefined ? short_name : name !== undefined ? name : ''}</div>
                </td>`;
        }).reduce((prev, curr) => prev + curr, '');
        $('#table').append(`<tr>${day_string}</tr>`);
    }
}

ClassSchedule.refreshTable = function(/**@type {Date}*/ date=new Date()) {
    let current_dotw = date.getDay();
    let current_hm = date.getHourMinute();
    for(let y = 0; y < schedule[0].length; y++) {
        
        let start_time = time_length.start + time_length.break + y * (time_length.class + time_length.break) + (y > time_length.lunch_time_index-1 ? time_length.lunch : 0);
        let end_time = start_time + time_length.class;

        schedule.forEach((arr, dotw) => {
            if(subjects[arr[y]] === undefined) return;
            let {zoom_link, name} = subjects[arr[y]];

            let subject_time_status = '';
            if(current_dotw > dotw+1 || (current_dotw === dotw+1 && current_hm >= end_time)) subject_time_status = 'done-subject';
            else if(current_dotw === dotw+1 && start_time <= current_hm && current_hm < end_time) subject_time_status = 'doing-subject';

            $(`#time_td_${dotw}_${y}`).attr('class', `subject-td ${subject_time_status}`);
        });
    }
}

ClassSchedule.getTimeIndex = function(/**@type {Date}*/ date=new Date()) {
    let current_hm = date.getHourMinute() - time_length.start;
    let lunch_start = time_length.lunch_time_index * (time_length.class + time_length.break);
    let index = Math.floor(
        (current_hm < (lunch_start + time_length.lunch) ? current_hm : current_hm - time_length.lunch) / (time_length.class + time_length.break)
    );
    return index;
}

ClassSchedule.refreshCurrentSubject = function(/**@type {Date}*/ date) {
    if(this.selector.dotw !== undefined && this.selector.y !== undefined) return;
    let current_dotw = date.getDay() - 1;
    let current_hm = date.getHourMinute();
    if(current_dotw === -1 || current_dotw === 5) { // Weekends
        this.setMessage('weekend'); return;
    }
    if(current_hm < time_length.morning_start) { // Early mornings
        this.setMessage('early_morning'); return;
    }
    current_hm -= time_length.start;
    let lunch_start = time_length.lunch_time_index * (time_length.class + time_length.break);
    let index = this.getTimeIndex();
    let subject = subjects[schedule[current_dotw][index]];
    if(current_hm < 0) { // Morning
        this.setMessage('morning');
    }
    else if(lunch_start <= current_hm && current_hm < lunch_start + time_length.lunch) { // Lunch time
        this.setMessage('lunch');
    }
    else { // Not lunch time
        if(current_hm >= (lunch_start + time_length.lunch)) current_hm -= time_length.lunch;
        if(index >= schedule[current_dotw].length) {
            this.setMessage('done');
        }
        else if(current_hm % (time_length.class + time_length.break) < time_length.break) {
            if(subject === undefined) { // No next classes
                this.setMessage('done');
            }
            else { // Break time
                this.setMessage('break', subject);
            }
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
            this.setDirectLinks(subjects['']);
            break;
        case 'done':
            $('#subject-message').html('오늘 수업은 다 끝났습니다.');
            this.setDirectLinks(subjects['']);
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
            this.setDirectLinks(subjects['']);
            break;
        case 'early_morning':
            $('#subject-message').html(`아직은 아침 조회 시간이 아닙니다.`);
            this.setDirectLinks(subjects['']);
            break;
        case 'morning':
            $('#subject-message').html(`지금은 <span class="current-subject">아침 조회 시간</span>입니다.`);
            this.setDirectLinks(subjects['morning']);
            break;
    }
}

ClassSchedule.refreshContents = function(/**@type {Date}*/ date=new Date()) {
    ClassSchedule.setSelectedSubjectMessage(date);
    ClassSchedule.refreshTable(date);
    ClassSchedule.refreshCurrentSubject(date);
    $('.time').text(
        `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}) ` +
        `${('00' + date.getHours()).slice(-2)}:${('00' + date.getMinutes()).slice(-2)}:${('00' + date.getSeconds()).slice(-2)}`
    );
}

ClassSchedule.setDirectLinks = function(/**@type {Subject}*/{zoom_link, wedorang_link}) {
    if(wedorang_link === undefined) $('#wedorang-button').hide();
    else {
        $('#wedorang-button').show();
        $('#wedorang-button').attr('href', wedorang_link);
    }
    if(zoom_link === undefined) $('#zoom-button').hide();
    else {
        $('#zoom-button').show();
        $('#zoom-button').attr('href', zoom_link);
    }
}

ClassSchedule.setSelectedSubjectMessage = function(/**@type {Date}*/date=new Date()) {
    if(this.selector.dotw !== undefined && this.selector.y !== undefined) {

        let current_index = ClassSchedule.getTimeIndex(), current_dotw = new Date().getDay() - 1;
        if(current_dotw === this.selector.dotw && current_index === this.selector.y) {
            ClassSchedule.selector = {dotw: undefined, y: undefined};
            $('#go-back').hide();
            return;
        }

        let subject = subjects[schedule[this.selector.dotw][this.selector.y]];

        if(current_dotw === this.selector.dotw) {
            if(this.selector.y < current_index) {
                $('#subject-message').html(`선택한 과목 <span class="current-subject">${subject.name}</span>까지 1주일 남았습니다.`);
            }
            else {   
                $('#subject-message').html(`선택한 과목 <span class="current-subject">${subject.name}</span>까지 ${this.selector.y - current_index}교시 남았습니다.`);
            }
        }
        else {
            let delta = (((this.selector.dotw - current_dotw) % 7) + 7) % 7;
            $('#subject-message').html(`선택한 과목 <span class="current-subject">${subject.name}</span>까지 ${delta}일 남았습니다.`);
        }
        this.setDirectLinks(subject);
        $('#go-back').show();
    }
    else {
        $('#go-back').hide();
    }
}

$(() => {

    ClassSchedule.initializeTable();
    ClassSchedule.refreshContents()
    setInterval(() => ClassSchedule.refreshContents(), 500);


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
    })


})