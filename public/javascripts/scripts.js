/* document.addEventListener("DOMContentLoaded", function() {
    console.log('Doc Ready');
}); */

function getSubredditRules() {
    let fetchSubredditName = document.getElementById('txt-get-subreddit-rules').value; //Get subreddit name from Rules text field

    //Fetch request to Express API
    fetch('/getsubredditrules' + '?subredditName=' + fetchSubredditName, {method: 'GET'})
        .then((response)=> {
            if(response.ok) return response.json(); //Return response if successfull
            throw new Error('Request failed.'); //Throw error if error
        }).then((data)=> {
            document.getElementById('subreddit-listing').innerHTML = '<div class="content-box"></div>'; //Reset the target container DIV

            data['rules'].forEach((item, index)=> { //Output each rule to the target container DIV
                document.getElementById('subreddit-listing').getElementsByClassName('content-box')[0].innerHTML += '<h2>' + data.rules[index].short_name + '</h2>' + data.rules[index].description_html.replace(/href="\/r\//g, 'href="https://www.reddit.com/r/');
            });

            document.getElementById('title-render').getElementsByTagName('span')[0].innerHTML = ': Rules'; //Append response type to title

            logReponse(data); //Log response data to output div
        })
        .catch((error)=> { console.log(error); });
}

function getBySort(getType) { //getTYpe should be 'getnew', 'gethot', 'getrising', 'gettop', or 'getcontroversial'
    let listItemTemplate = document.getElementsByClassName('subreddit-item')[0].cloneNode(true); //Grab subreddit item template for cloning
    let fetchSubredditName = document.getElementById('txt-' + getType).value; //Get subreddit value from text field
    let fetchSubredditPostCount = document.getElementById('txt-post-count').value; //Get post return limit from text field
    let fetchSubredditTimeFrame = function() {
        if(getType === 'gettop' || getType === 'getcontroversial') { //Append timeframe parameter if the getype is top or controversial
            return '&subredditTimeframe=' + document.getElementById('dd-options_' + getType).value; //Get post timeframe
        } else { return ''; }
    }

    document.getElementById('title-render').getElementsByTagName('span')[0].innerHTML = ': /' + getType; //Append response type to title
    
    //Fetch request to Express API
    fetch('/' + getType + '?subredditName=' + fetchSubredditName + '&subredditPostCount=' + fetchSubredditPostCount + fetchSubredditTimeFrame(), {method: 'GET'})
        .then((response)=> {
            console.log(response);
            if(response.ok) return response.json();
            throw new Error('Request failed.');
        }).then((data)=> {
            console.log(data);
            document.getElementById('subreddit-listing').innerHTML = ''; //Clear listing DIV for new data

            data.forEach((item, index)=> {
                let tempItem = listItemTemplate.cloneNode(true);


                if(item.selftext_html !== null) { //If there is no article text render the media url instead
                    tempItem.getElementsByClassName('article-text')[0].innerHTML = item.selftext_html; //Render text content
                    tempItem.getElementsByClassName('article-url')[0].style.display = 'none';
                } else {
                    tempItem.getElementsByClassName('article-url')[0].innerHTML = '<p><i class="fas fa-paperclip"></i> <a href="' + item.url + '" target="_blank">' + item.url + '</a></p>'; //Render article content media URL
                    tempItem.getElementsByClassName('article-text')[0].style.display = 'none';
                }

                tempItem.setAttribute('id', 'post_' + item.id); //Give the item an ID so we can use it for a selector later
                tempItem.getElementsByTagName('h2')[0].innerHTML = item.title; //Render article title
                tempItem.getElementsByClassName('permalink')[0].innerHTML = '<a href="https://www.reddit.com' + item.permalink + '" target="_blank">Reddit Link</a>'; //Render permalink
                tempItem.getElementsByClassName('label-username')[0].innerHTML = 'by <a href="https://www.reddit.com/user/' + item.author + '/" target="_blank">u/' + item.author + '</a>'; //Render username
                tempItem.getElementsByClassName('label-postdate')[0].innerHTML = ' on ' + utcToDate(item.created_utc); //Render post date
                tempItem.getElementsByClassName('label-comments')[0].innerHTML = '<a href="#" class="link-button" onclick="getComments(\'' + item.id + '\'); return false;">' +item.num_comments + ' Comments</a>'; //Render comments count
                tempItem.getElementsByClassName('upvote-count')[0].innerHTML = item.ups; //Render upvote
                
                if(item.post_hint !== null) { //Check post hint for media files
                    switch(item.post_hint) {
                        case 'image': //Append image tag for preview
                            tempItem.getElementsByClassName('article-url')[0].innerHTML += '<p><img class="media-preview-image" src="' + item.url + '" /></p>'; //Render image content
                            break;
                    }
                }

                document.getElementById('subreddit-listing').appendChild(tempItem); //Append new item to list div
                
                tempItem.style.display = 'flex'; //Show new item
            });

            logReponse(data); //Log response data to output div
        })
        .catch((error)=> { console.log(error); });
}

function getComments(itemId) {
    fetch('/getcomments' + '?subredditId=' + itemId, {method: 'GET'})
        .then((response)=> {
            if(response.ok) return response.json();
            throw new Error('Request failed.');
        }).then((data)=> {
            var commentMarkup = '';
            //console.log(data.comments);
            //console.log('----');
            data.comments.forEach((item, index)=> {
                commentMarkup += '<div class="parent-reply"><span class="post-byline"><i class="fab fa-reddit"></i> by <a href="https://www.reddit.com/user/' + item.author + '/" target="_blank">u/' + item.author + '</a> on ' + utcToDate(item.created_utc) + '</span><br>' + item.body_html;

                var itemReplies = item.replies;
                //console.log(itemReplies);
                //console.log(itemReplies.length);

                if(itemReplies.length > 0) {
                    for(i=0; i <= itemReplies.length-1; i++) {
                        commentMarkup += '<hr><div class="nested-reply"><span class="post-byline"><i class="fab fa-reddit"></i> by <a href="https://www.reddit.com/user/' + itemReplies[i].author + '/" target="_blank">u/' + itemReplies[i].author + '</a> on ' + utcToDate(itemReplies[i].created_utc) + '</span><br>' + itemReplies[i].body_html + '</div>';
                    }
                }
                commentMarkup += '</div><hr>';
            });
            document.getElementById('post_' + itemId).getElementsByClassName('comments-container')[0].innerHTML = '<h5>Comments</h5>' + commentMarkup;

            logReponse(data); //Log response data to output div
        })
        .catch((error)=> { console.log('ERROR'); console.log(error); });
}

function utcToDate(timestamp) { //Use for converting post times to a readable time
    var date = new Date(timestamp * 1000);
    return date.toString();
}

function logReponse(data) { //Log data to textarea, also add line breaks for readability
    document.getElementById('req-output').value = JSON.stringify(data).replace(/,/g, ',\n').replace(/{/g, '{\n');
}