var currentSelection = {}
var reviewID;




function apiCall(searchItems) {

  //var queryURL = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + "sushi" + "&location=" + "toms+river" + "&radius=" + 10000 + "&limit=" + 10 + "&price=" + 2;
  var queryURL = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + searchItems.keyword + "&location=" + searchItems.location + "&radius=" + searchItems.radiusSelected + "&limit=" + searchItems.resultsSelected + "&price=" + searchItems.priceSelected;

  $.ajax({
    url: queryURL,
    method: "GET",
    headers: {
      "Authorization": "Bearer 2VxyWI6FPmn6irj6VKvlO6GWV0pNBEf5Efh89Mki_C5OmrAlqtY4kLYhkrsnKnm2U6vqZHq5a8Yh1hHu4FfcNHVej_aYkyeXI9xEMqzr-KQ0_EAU-EhBaQy4NIeiW3Yx",
      "Access-Control-Allow-Origin": "*"
    }
  }).then(function (response) {

    console.log(response)

    for (var i = 0; i < response.businesses.length; i++) {
      var name = response.businesses[i].name;
      var address = response.businesses[i].location.display_address[0];
      var cityOnly = response.businesses[i].location.city;
      var stateOnly = response.businesses[i].location.state;
      var zipOnly = response.businesses[i].location.zip_code;
      var categories = response.businesses[i].categories;
      var categoriesArray = [];
      var price = response.businesses[i].price;
      var distance = response.businesses[i].distance;
      // lat = response.businesses[i].coordinates.latitude
      // long = response.businesses[i].coordinates.longitude

      for (var j = 0; j < categories; j++) {
        categoriesArray.push(categories[j].title);
      }

      var $restaurantDiv = $("<div class='card d-inline-block m-1' id='rest-card' style='width: 16rem;'>");
      var $cardBodyText = $("<div class='card-body card-text p-2 mb-3' id='rest-card-text'>");
      var $cardBodyButton = $("<div class='card-body card-button text-center pt-0'>");

      var $name = $("<h5 class='card-title text-center mb-0' id='store-name'>").text(name);
      var $address = $("<p class='card-text'>").text(address);
      var $city = $("<p class='card-text'>").text(cityOnly + ", " + stateOnly + " " + zipOnly);
      var $categoriesArray = $("<p class='card-text'>").text(categoriesArray.join(", "));
      var $price = $("<p class='card-text'>").text(price);
      var $distance = $("<p class='card-text'>").text(metersToMiles(distance) + " miles");
      var $reviewButton = $("<button type='button' class='btn btn-secondary btn-sm btn-block' id='review-button' data-toggle='modal' data-target='#submit-modal'>Submit Review!</button>");

      $($cardBodyText).append($name, $address, $city, $categoriesArray, $price, $distance);
      $($cardBodyButton).append($reviewButton);
      $($restaurantDiv).append($cardBodyText, $cardBodyButton);


      $("#store-results").append($restaurantDiv);


    }

    function metersToMiles(meters) {
      var m = parseFloat(meters);
      var mi = "";
      if (!isNaN(m)) {
        mi = Math.round((m * 0.00062137119) * 10) / 10;
      }
      return mi;
    }
  });
}


function processSelectedFiles(fileInput) {
  var file = fileInput.files[0];
  // Get a reference to the location where we'll store our photos

  photoRef = firebase.storage().ref().child('photos').child(file.name);
  // Upload file to Firebase Storage

  var uploadTask = photoRef.put(file).then(function (snapshot) {
    console.log('Uploaded a blob or file!');
  });

}



$(document).ready(function () {

  $("#clear-search").click(function (event) {
    $("#store-results").text("");
  });

  $("#submit-search").on("click", function (event) {

    $("#store-results").text("")

    event.preventDefault();

    var priceSelectedArray = [];
    $("input:checkbox[name='price']:checked").each(function (i) {
      priceSelectedArray[i] = $(this).val();
    })

    var searchItems = {
      keyword: $("#keyword").val(),
      location: $("#location").val(),
      radiusSelected: Math.floor($("input:radio[name='radius']:checked").val()),
      resultsSelected: $("input:radio[name='results']:checked").val(),
      priceSelected: priceSelectedArray
    }

    apiCall(searchItems);

  })

  $(document).on("click", "#review-button", function () {
console.log($(this))

    currentSelection = {};

    currentSelection.restaurant = $(this).parent().parent()[0].childNodes[0].children[0].innerHTML
    currentSelection.cityState = $(this).parent().parent()[0].childNodes[0].children[2].innerHTML.replace(/[0-9]/g, '').trim();
  })

  $("#submit-item-form").on("click", function (event) {

    event.preventDefault();

    var itemName = $("#submit-item-name").val().trim();
    var foodDrink = $("input:radio[name='submit-item-category']:checked").val();
    var rating = $("input:radio[name='submit-item-rating']:checked").val();
    var description = $("#submit-item-description").val()
    var review = $("#submit-item-review").val().trim();
    var mfOptions = $("#mouthfeel-options").val();

    //database
    currentSelection.review = review;
    currentSelection.description = description;
    currentSelection.foodDrink = foodDrink;
    currentSelection.reviewID = reviewID;

    //for the card
    currentSelection.itemName = itemName;
    currentSelection.options = mfOptions.slice(0, 3).join(", ");
    currentSelection.rating = rating;

    photoRef.getDownloadURL().then(function (url) {
      currentSelection.url = url
      database.ref().push(currentSelection);
    })

    reviewID++;

    database.ref("reviewID").set({
      number: reviewID
    })


    $('input[name="submit-item-category"]').prop('checked', false);
    $('input[name="submit-item-rating"]').prop('checked', false);
    $("#submit-item-name").val("");
    $("#submit-item-description").val("");
    $("#submit-item-review").val("");
    $("#mouthfeel-options").val("");
    $("#file-upload").val("");



  });

  $("#clear-item-form").on("click", function () {
    $('input[name="submit-item-category"]').prop('checked', false);
    $('input[name="submit-item-rating"]').prop('checked', false);
    $("#submit-item-name").val("");
    $("#submit-item-description").val("");
    $("#submit-item-review").val("");
    $("#mouthfeel-options").val("");
    $("#file-upload").val("");
  })

  $(document).on("click","#review-card", function() {

    console.log($(this))
    console.log($(this).attr("src"))

    var dataset = $(this)

    var image = dataset[0].childNodes[0].attributes.src.value
    var description = dataset[0].dataset.description
    var review = dataset[0].dataset.review
    var mouthFeel = dataset[0].mf
    // long = dataset[0].long
    // latt = dataset[0].lat



    $(".ex-img").attr("src", image)

    var $description = $("<div>").text(description)
    var $review = $("<div>").text(review)
    var $mouthFeel = $("<div>").text(mouthFeel)
    // var $long = $("<div>")
    // var $lat = $("<div>")

    
    $(".info-div").append($description, $review, $mouthFeel)






  })


});

