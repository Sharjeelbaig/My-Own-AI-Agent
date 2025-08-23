import axios from 'axios';
import * as cheerio from 'cheerio';

export async function search(query) {
    try {
        // Using DuckDuckGo Instant Answer API for web search
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
        
        const response = await axios.get(searchUrl);
        const data = response.data;
        
        let searchResults = {
            query: query,
            results: []
        };

        // Get instant answer if available
        if (data.Answer) {
            searchResults.results.push({
                type: 'instant_answer',
                content: data.Answer,
                source: data.AnswerType || 'DuckDuckGo'
            });
        }

        // Get abstract if available
        if (data.Abstract) {
            searchResults.results.push({
                type: 'abstract',
                content: data.Abstract,
                source: data.AbstractSource || 'Wikipedia',
                url: data.AbstractURL
            });
        }

        // Get definition if available
        if (data.Definition) {
            searchResults.results.push({
                type: 'definition',
                content: data.Definition,
                source: data.DefinitionSource || 'Dictionary',
                url: data.DefinitionURL
            });
        }

        // Get related topics
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.slice(0, 3).forEach(topic => {
                if (topic.Text) {
                    searchResults.results.push({
                        type: 'related_topic',
                        content: topic.Text,
                        url: topic.FirstURL
                    });
                }
            });
        }

        // If no results, try a basic web scraping approach
        if (searchResults.results.length === 0) {
            try {
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                const searchResponse = await axios.get(googleSearchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                const $ = cheerio.load(searchResponse.data);
                const searchSnippets = [];

                // Extract search result snippets
                $('.VwiC3b').each((i, element) => {
                    if (i < 3) { // Limit to first 3 results
                        const snippet = $(element).text().trim();
                        if (snippet) {
                            searchSnippets.push(snippet);
                        }
                    }
                });

                if (searchSnippets.length > 0) {
                    searchResults.results.push({
                        type: 'web_search',
                        content: searchSnippets.join(' | '),
                        source: 'Google Search'
                    });
                }
            } catch (scrapeError) {
                // Fallback to a curated response
                searchResults.results.push({
                    type: 'fallback',
                    content: `I searched for "${query}" but couldn't retrieve specific web results at the moment. However, I can still provide you with general knowledge and assistance on this topic.`,
                    source: 'Assistant'
                });
            }
        }

        return JSON.stringify(searchResults, null, 2);
    } catch (error) {
        return JSON.stringify({
            query: query,
            error: 'Search temporarily unavailable',
            fallback: `I apologize, but web search is temporarily unavailable. However, I can still help you with "${query}" using my built-in knowledge. Please let me know what specific aspects you'd like to know about.`
        }, null, 2);
    }
}
