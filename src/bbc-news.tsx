import { ActionPanel, Action, List, open } from "@raycast/api";
import Parser from "rss-parser";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

const CATEGORIES = [
  { title: "Top Stories", value: "top", url: "http://feeds.bbci.co.uk/news/rss.xml" },
  { title: "World", value: "world", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
  { title: "UK", value: "uk", url: "http://feeds.bbci.co.uk/news/uk/rss.xml" },
  { title: "Business", value: "business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
  { title: "Technology", value: "technology", url: "http://feeds.bbci.co.uk/news/technology/rss.xml" },
  { title: "Science", value: "science", url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
  { title: "Health", value: "health", url: "http://feeds.bbci.co.uk/news/health/rss.xml" },
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

async function fetchNews(url: string): Promise<NewsItem[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(url);

  return feed.items.map((item) => ({
    title: item.title || "",
    link: item.link || "",
    pubDate: item.pubDate || "",
    description: item.contentSnippet || "",
  }));
}

export default function Command() {
  const [categoryUrl, setCategoryUrl] = useState(CATEGORIES[0].url);

  const { data: items, isLoading } = useCachedPromise(fetchNews, [categoryUrl], {
    keepPreviousData: true,
  });

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      navigationTitle="BBC News Headlines"
      searchBarPlaceholder="Search headlines..."
      searchBarAccessory={
        <List.Dropdown tooltip="Category" onChange={setCategoryUrl}>
          {CATEGORIES.map((cat) => (
            <List.Dropdown.Item key={cat.value} title={cat.title} value={cat.url} />
          ))}
        </List.Dropdown>
      }
    >
      {items?.map((item, index) => (
        <List.Item
          key={index}
          title={item.title}
          detail={
            <List.Item.Detail
              markdown={`## ${item.title}\n\n${item.description}`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Published"
                    text={new Date(item.pubDate).toLocaleString()}
                  />
                  <List.Item.Detail.Metadata.Link title="Article" target={item.link} text="Open in Browser" />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={item.link} />
              <Action.CopyToClipboard content={item.link} title="Copy Link" shortcut={{ modifiers: ["cmd"], key: "c" }} />
              <Action
                title="Open All in Browser"
                shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
                onAction={() => items.forEach((i) => open(i.link))}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
