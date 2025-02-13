import { sanityClient } from "@/sanity/client";
import { PortableText } from "@portabletext/react";

async function getFAQPage() {
  return await sanityClient.fetch(`*[_type == "faqPage"][0]`);
}

export default async function FAQPage() {
  const faqPage = await getFAQPage();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{faqPage.title}</h1>
      <p className="text-gray-700">{faqPage.description}</p>
      <div className="mt-6">
        <PortableText value={faqPage.content} />
      </div>
    </div>
  );
}
