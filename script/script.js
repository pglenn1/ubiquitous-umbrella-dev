$(function() {
    console.log("doc is ready");

    $("#btnGetFacts").click(function () {
        let userName = $("#userName").val(); 
        let spiritAnimals = ['Wolf', 'Bear', 'Eagle', 'Lion', 'Dolphin', 'Owl']; 
        
        let randomIndex = Math.floor(Math.random() * spiritAnimals.length); 
        
        let selectedAnimal = spiritAnimals[randomIndex]; 
        
        let message = `Hey ${userName}, your spirit animal is ${selectedAnimal}.`; 
        
        
        $('#result').text(message);
    });

});