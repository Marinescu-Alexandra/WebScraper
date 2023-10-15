# WebScraper Documentation
 ## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [API Usage](#api-usage)
  - [Endpoints Details](#endpoints-details)
  - [Parameters](#parameters)
  - [Response](#response)
  - [Potential Errors](#potential-errors)
* [User Interface](#user-interface)
* [Explanations](#explanations)
  - [Scraping Algorithm](#scraping-algorithm)
  - [Sentiment Analysis Algorithm](#sentiment-analysis-algorithm)
  - [Bonus Task](#bonus-task)
  - [Features Ideas](#features-ideas)
  - [Thoughts and Experience](#thoughts-and-experience)


## General info
This project is simple web scraping application, meant to scrape content from https://wsa-test.vercel.app/. The scraped data is returned in a JSON format, and can be filtered by multiple queries.
The scraped data is displayed on a frontend server and can be easily copied with a button.
	
## Technologies
Project is created with:
* Node version: v18.17.0
* NPM version: 9.6.7
* Angular version: 16.2.9
	
## Setup
To run this project you must have valid Node and Angular versions installed.

To run the Frontend server do:
```
cd Frontend
npm install
ng serve
```

To run the Backend server do:
```
cd Backend
npm install
node .\index.js
```

## API Usage
### Endpoints Details

- **Name**: Scrape Content
- **Method**: GET
- **URL**: `/scrape`

**Description**:  
This endpoint allows users to scrape content from a specified URL and apply various filters to the requested data.

### Parameters:

#### `url`
- **Type**: URL string
- **Description**: The URL from which content is to be scraped.
- **Validation**: Must be a valid URL format.
- **Required**: Yes

#### `sentiment`
- **Type**: string
- **Description**: Filter results based on sentiment.
- **Validation**: Must be one of ["negative", "positive", "neutral"].
- **Required**: No

#### `category`
- **Type**: string
- **Description**: Filter results based on category.
- **Validation**: Must have at least 2 letters.
- **Required**: No

#### `minIsoDate`
- **Type**: string (ISO8601 format)
- **Description**: Filter results to only include posts after this date.
- **Validation**: Must be a valid ISO date.
- **Required**: No

#### `maxIsoDate`
- **Type**: string (ISO8601 format)
- **Description**: Filter results to only include posts before this date.
- **Validation**: Must be a valid ISO date.
- **Required**: No

#### `blogContent`
- **Type**: boolean
- **Description**: Determines if the blog content should be returned.
- **Validation**: Must be a boolean value.
- **Required**: No

### Response:

**Status Code**: `200 OK`

Upon successful execution, the API will return a list of objects. Each object contains the following properties:

- `post_image`: URL of the post's image. Type: `string` or `null`.
- `post_date`: Date the post was published. Type: `string` or `null`.
- `post_category`: Category of the post. Type: `string` or `null`.
- `post_href`: URL of the post. Type: `string` or `null`.
- `post_title`: Title of the post. Type: `string` or `null`.
- `post_short_description`: A brief summary or snippet from the post. Type: `string` or `null`.
- `author_avatar`: URL of the author's avatar or image. Type: `string` or `null`.
- `author_name`: Name of the post's author. Type: `string` or `null`.
- `author_profession`: Profession or title of the post's author. Type: `string` or `null`.
- `words`: Number of words in the post. Type: `int` or `null`.
- `blog_content`: Content of the blog post. Type: `string` or `null`.

### Potential Errors:

**Status Code**: `400 Bad Request`  
**Description**: The request was formed incorrectly or included invalid parameters.  
**Possible Reasons**:  
- Invalid URL format.
- Bad sentiment query parameter; sentiment must be positive, negative, or neutral.
- Bad category query parameter; category must have at least 2 letters.
- Bad minIsoDate query parameter; the date must be a valid ISO date.
- Bad maxIsoDate query parameter; the date must be a valid ISO date.
- Bad blogContent query parameter; blogContent must be a boolean value.
- The target website at the given URL cannot be accessed at the moment.
- The specific route at the given URL could not be located on the target website.

**Status Code**: `502 Bad Gateway`  
**Description**: Issues on the target website prevented the scraping process.  
**Possible Reasons**:  
- Data extraction from the provided URL is impossible due to issues occurring on the destination website.

**Status Code**: `500 Internal Server Error`  
**Description**: An unexpected error occurred on the server side.

## User Interface
A simple user interface was made for the project. The user can input a URL, or use the default one and the result of the API request is displayed below in JSON format. Aditionally, the user can filter the posts by specifying the desired filters in a modal that pops-up when the Filters button is pressed. Lastly, the user can copy the result by pressing the Copy button.

![image](https://github.com/Marinescu-Alexandra/WebScraper/assets/73072605/097cfe77-2165-4b92-9e0c-e514b90ad11e)
![image](https://github.com/Marinescu-Alexandra/WebScraper/assets/73072605/75b5f171-04f2-4ec0-890f-1590d7ae4df0)

## Explanations

### Scraping Algorithm
We use the Puppeteer library to perform web scraping because the target website relies heavily on client-side rendering, meaning it generates content directly within the browser. Traditional scraping methods aren't effective here. We use a headless browser to navigate the required pages and extract the needed data from the Document Object Model (DOM).

To optimize performance and response time, we create a single browser instance at the server's start rather than initiating a new one for each request. We visit the target URL and extract posts not by their class names or IDs but by looking at the HTML tag elements. Specifically, we gather all nodes that meet the condition 'a:has(img) + div,' which translates to all divs immediately following an <a> tag containing an image.

After this, the process involves navigating through sibling, parent, and child tags of these elements to extract the necessary information from each post. To obtain data about individual blog posts, we obtain the post URLs from the list of results and extract the text concurrently using Promise.allSettled. This speeds up the requests and ensures that if there's an issue with one blog post, it won't cancel the other blog promises.

Since this is a test website with only a few posts, I've chosen to execute all tasks at once for efficiency. However, it's worth noting that on real target websites with rate limiting mechanisms, this approach could encounter issues. In such cases, it would be wise to implement a feature that processes tasks in chunks as needed.

The results of the scraped blog data are then organized and placed in their respective posts.

### Sentiment Analysis Algorithm

We evaluate the sentiment of each post based on its title and short description, as described in the requirements. It wasn't clear whether the entire blog post should be used or not, because the word count task referred to the words inside the _"blog post content"_ while this task specifically mentioned _"the text from each post"_. Therefore, I decided to analyze only the text from the post.

To determine the sentiment of the text, we use a "score" counter. If the score is less than zero, the overall sentiment of the post is negative. If the score is greater than zero, the resulting sentiment is positive. If the score is zero, the sentiment is neutral.

To calculate the score, we need to assess the sentiment of each word in the text. To do this, we rely on pre-compiled lists of positive words (e.g., good, funny, happy), negative words (e.g., bad, foul, war, agony), intensifier words (e.g., very, really, extremely), and negation words (e.g., not, barely, never).

Any words in the post that are not found in these lists are ignored, and the rest of the operations are performed on the remaining words. For instance, if we have the following words in the post: ["Today", "the", "weather", "was", "not", "that", "bad", "I", "was", "very", "happy,"] after filtering, we're left with ["not," "bad," "very," "happy."]. We perform this filtering step because if we directly checked each positive and negative word and their possible negations or intensifiers without this filter, negations like "not that bad" would be lost. The algorithm can also handle combinations of negations and intensifiers.

If a word is not in any precompiled list, we simplify it. This means that if the word ends with a common suffix like "ing," "ed," "s," etc., we remove the suffix and then reevaluate the word.

After obtaining the filtered words, we iterate through them. We create a new variable to keep track of the current score of the filtered word and a boolean variable to track the current negation. If the current filtered word is a negation, we set the current negation to true and move to the next iteration. If the current filtered word is an intensifier, we also skip to the next iteration. If the current filtered word is a negative word, the current score is multiplied by -1. If the previous word is an intensifier, the current score is multiplied by 2. If the current negations flag is set to true, the current score is multiplied by -1, and then the flag is set to false. Finally, the resulting current score of the word is added to the overall score of the text.

After completing all the iterations, the final score represents the sentiment of the text.

### Bonus Task
I added filtering capabilities to the API, the filters are briefly explained on the [usage of the API](#api-usage).

### Features Ideas
- Server side rendering with the scraped results
- Notify users when new posts are added (Push notifications / RSS Feed / EMail subscription / etc.)
- Determine content type (tutorial, story, news, recipe, sensitive, mature, etc.)

### Thoughts and Experience
Stepping out of your comfort zone is never an easy task, but it can be very useful and rewarding and that's how I felt learning Angular. I found Angular to be very different compared to known frameworks to me, but once I got the hang of it, I can say it is a very powerful tool and fun to use.
As for the overall experience while building the app I can say it was extremely positive. I enjoyed creating this app and it was a great exeperience to learn new things.


 
