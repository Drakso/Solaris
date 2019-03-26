let isModalExpanded = false;

// OPEN / CLOSE ADVANCE MENU
$('.advanceBtn').click(function() {
    console.log("ADVANCED button clicked!");    //////////////////////////////// DBG
    if(!isModalExpanded){
        // Show Contents
        $('.advanceBox').addClass('showAdvanced');
        $('.advanceBox').removeClass('hideAdvanced');
        // Expand Modal
        $('.calculateBox').addClass('modalExpanded');
        $('.calculateBox').removeClass('modalRetracted');
        // Btn color
        $('.advanceBtn').addClass('advanceBtnClicked');
        $('.advanceBtn').removeClass('advanceBtnBack');
        isModalExpanded = true;
        console.log("class added!");    //////////////////////////////// DBG 
    } else {
        // Hide Contents
        $('.advanceBox').addClass('hideAdvanced');
        $('.advanceBox').removeClass('showAdvanced');
        // Retract Modal
        $('.calculateBox').removeClass('modalExpanded');
        $('.calculateBox').addClass('modalRetracted');
        // Btn color
        $('.advanceBtn').addClass('advanceBtnBack');
        $('.advanceBtn').removeClass('advanceBtnClicked');
        isModalExpanded = false;
        console.log("class removed");    //////////////////////////////// DBG
    }
});

// SLIDER 

$(document).ready(function() {

    var $element = $('input[type="range"]');
    var $handle;

    $element.rangeslider({
        polyfill: false,
        onInit: function() {
            $handle = $('.rangeslider__handle', this.$range);
            updateHandle($handle[0], this.value);
            $("#amount-label").html( this.value + "%");
        }
    }).on('input', function() {
        updateHandle($handle[0], this.value );
        $("#amount-label").html( this.value + "%");
    });

    function updateHandle(el, val) {
        el.textContent = val;
    }

    $('input[type="range"]').rangeslider();

});

// POPOVER

$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
});

// CALCULATRON

/* 
First Digit
1 = Directly South
2 = South South West ( 22.5 deg from south )
3 = South West ( 45 deg from south )
4 = West South West ( 67.5 deg from south )
5 = Directly West
6 = South South East ( 22.5 deg from south )
7 = South East ( 45 deg from south )
8 = East South East ( 67.5 deg from south )
9 = Directly East

Second Digit
1 = Vertical Surface
2 = Optimal Angle ( 48deg )
3 = Adjusted Throughout the Year
4 = Winter Angle ( 33deg )
5 = Summer Angle ( 63deg )
6 = Horizontal Surface
*/


// Global Constants
let today = new Date();
let angle = 2;
let position = 1;
let shade = 0;
let sunInfo;
let switchRemember = true;
console.log("Position = " + position);    ////////////////////////////////DBG
console.log("Angle = " + angle);    ////////////////////////////////DBG
let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let monthNames = ["january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"];
// SWITCH

let switchKwh = $(".spanKwh");
let inputPower = $(".inputPower");
let switchOn = $(".switchOn");


switchOn.click(function() {
    if(switchRemember){
        switchKwh.text("m²");
        inputPower.attr("placeholder", "Panels");
        switchRemember = false;
        switchKwh.css("padding-left", "23px")
    } else if(!switchRemember){
        switchKwh.text("Kwh");
        inputPower.attr("placeholder", "Power");
        switchRemember = true;
        switchKwh.css("padding-left", "12px")
    }
});

// Functions

function calculateMonthly(power){
    let monthNow = today.getMonth()+1;
    return power * daysInMonth[monthNow];
}

function calculateYearly(data){
    let yearlyResult = 0;
    console.log("Starting to calculate YEARLY!");  /////////////////////////////////DBG
    for(let i = 1; i < monthNames.length; i++){
        yearlyResult += data[monthNames[i]] * daysInMonth[i];
        console.log("For month: " + monthNames[i] + " which gives " + data[monthNames[i]] + " power we get " + (data[monthNames[i]] * daysInMonth[i]));  /////////////////////////////////DBG
        console.log("Final yearly result now is: " + yearlyResult);  /////////////////////////////////DBG
    }
    console.log("Final yearly result: " + yearlyResult);  /////////////////////////////////DBG
    return yearlyResult;
}

// AJAX CALL

$(document).ready(function(){
    $.ajax({url: "SunInfo.json", success: function(response){
        sunInfo = response;
        console.log(sunInfo);   ////////////////////////////////DBG
    }});
});

// selectors
let mainInput = $(".inputPower");
let powerInput = $(".powerInput");
let panelsInput = $(".panelsInput");
let powerBtn = $(".powerBtn");
let panelsBtn = $(".panelsBtn");
let result1 = $(".panelsResultNo");
let result2 = $(".powerOutput");
let submitBtn = $(".submitBtn");

// Listeners
submitBtn.on("click", ()=>{
   console.log("submit clicked!");
    $('#modalwindow').modal('hide');
    if(switchRemember == true){
        calcPower();
        $( ".result" ).removeClass( "hide" );
    } else {
        calcPanels();
        $( ".result" ).removeClass( "hide" );
    }

});

let month = monthNames[today.getMonth()]; // Get current month by name
function calcPower(){
    console.log("Power entered");   ////////////////////////////////DBG
    let powerResult; // Result of the combination from the api ( Contains data for all months )
    for(let i = 0; i < sunInfo.length; i++){ // Find the correct ID ( combination )
        if(sunInfo[i]._id == parseInt(position + "" + angle)){
            powerResult = sunInfo[i]; // fills powerResult with the found ID
        }
    }
    let finalResultMonthly = (mainInput.val() / calculateMonthly(powerResult[month]))*((100 - shade)/100);
    let finalResultDaily = (powerInput.val() / powerResult[month])*((100 - shade)/100);
    let finalResultYearly = (powerInput.val() / calculateYearly(powerResult))*((100 - shade)/100);
    console.log("Power a day for this month: " + powerResult[month]);    /////////////////////////////DBG
    result1.text(Math.ceil(finalResultMonthly));
    result2.text(mainInput.val());
    // result1.text(finalResultMonthly.toFixed(2) + "m² Panels are needed to produce " + powerInput.val() + "KWh this month.");
    // result2.text(finalResultDaily.toFixed(2) + "m² Panels are needed to produce " + powerInput.val() + "KWh daily for this month.");
    // result3.text(finalResultYearly.toFixed(2) + "m² Panels are needed to produce " + powerInput.val() + "KWh yearly.");


};

function calcPanels(){
    console.log("Panels entered");  ////////////////////////////////DBG
    let panelsResult; // Result of the combination from the api ( Contains data for all months )
    for(let i = 0; i < sunInfo.length; i++){ // Find the correct ID ( combination )
        if(sunInfo[i]._id == parseInt(position + "" + angle)){
            panelsResult = sunInfo[i]; // fills powerResult with the found ID
        }
    }
    let finalResultMonthly = (mainInput.val() * calculateMonthly(panelsResult[month]))*((100 - shade)/100);
    let finalResultDaily = (panelsInput.val() * panelsResult[month])*((100 - shade)/100);
    let finalResultYearly = (panelsInput.val() * calculateYearly(panelsResult))*((100 - shade)/100);
    console.log("Power a day for this month: " + panelsResult[month]);    /////////////////////////////DBG
    result1.text(mainInput.val());
    result2.text(Math.ceil(finalResultMonthly));
    // result1.text(panelsInput.val() + "m² Panels will produce " + finalResultMonthly.toFixed(2) + "KWh this month.");
    // result2.text(panelsInput.val() + "m² Panels will produce " + finalResultDaily.toFixed(2) + "KWh daily for this month.");
    // result3.text(panelsInput.val() + "m² Panels will produce " + finalResultYearly.toFixed(2) + "KWh yearly.");
};

// $(".positionDropdown").on("click", "a", function(e) {
//     position = $(e.target).data("id");
//     console.log("Position = " + position);  ////////////////////////////////DBG
// });
//
// $(".angleSelected").on("click", "option", function(e) {
//     angle = $(e.target).data("id");
//     console.log("Angle = " + angle);    ////////////////////////////////DBG
// });
//
// $(".monthSelected").on("click", "option", function(e) {
//     shade = $(e.target).data("id");
//     console.log("Shade = " + shade);    ////////////////////////////////DBG
// });

$(".positionSelected").on("change", ()=>{
    console.log($(".positionSelected").val());
    position =$(".positionSelected").val();
    console.log("Position = " + position);  ////////////////////////////////DBG
});

$(".angleSelected").on("change", ()=>{
    console.log($(".angleSelected").val());
    position =$(".angleSelected").val();
    console.log("Angle = " + angle);  ////////////////////////////////DBG
});

$(".monthSelected").on("change", ()=>{
    console.log($(".monthSelected").val());
    month =$(".monthSelected").val();
    console.log("Month = " + month);  ////////////////////////////////DBG
});

$('input[type=range]').on('input', function () {
    console.log($("input[type=range]").val());
    shade =$("input[type=range]").val();
    console.log("Shade= " + shade);  ////////////////////////////////DBG
});