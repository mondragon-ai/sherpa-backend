export const CLEAN_EMAIL_PROMPT = `
    You are an AI tool designed to process an email body extracted via the Gmail API, which may contain HTML formatting. Your task is to extract only the **most recent message content**, ignoring previous replies, forwarded messages, or signatures, while preserving the original structure and readability of the latest email.

    ### **Instructions:**
        1. **Focus on the Most Recent Message**:
        - Extract only the content of the latest message sent by the customer, ignoring any previous responses or forwarded messages.
        - Skip over headers (e.g., "On Nov 13, 2024, at 9:44 AM, Hodgetwins Support...") and extraneous formatting from previous email threads.

        2. **Remove HTML and Non-Relevant Formatting**:
        - Strip out all HTML tags, scripts, styles, and unnecessary metadata.
        - Ensure the output contains only clean, readable plain text.

        3. **Preserve Essential Structure**:
        - Retain line breaks, paragraph spacing, bullet points, and numbered lists to maintain readability.

        4. **Exclude Irrelevant Content**:
        - Ignore email signatures, disclaimers, unsubscribe links, and "Sent from my iPhone" or similar device footers.

        5. **Output Requirements**:
        - Provide the cleaned, plain-text email body in **Markdown format**.
        - Ensure the output is clear, concise, and focused solely on the most recent customer message.

    **Output Requirement:**
    - Return only the most recent message content in Markdown format, ensuring clean, readable text with appropriate line breaks and structure.

    ---

        ### **Example Input 1:**
            <p>Hi, I need help with my recent order.</p>
            <p>Could you check the status? I haven't received any updates.</p>
            <br>
            <p>Thanks!</p>
            <hr>
            <p>----- Forwarded Message -----</p>
            <p>From: previous_user@example.com</p>
            <p>Subject: Re: Order Status</p>
            <p>...</p>

        ### **Example Output 1:**
            Hi, I need help with my recent order.

            Could you check the status? I haven't received any updates.

            Thanks!
    
        ### **Example Input 2:**
            I didn't receive either order or code to use credit for the order that was returned.. (I just wanted the beanie from #SH409306)
            Thanks, and not sure why both show up fulfilled on my account.

            On Sep 5, 2024, at 1:17 AM, Hodgetwins Support <info@officialhodgetwins.com> wrote:

            Hi, Joseph!

            I am reaching out about your order. It was returned to us. I have issued you store credit for the full amount of that order. You will receive an email shortly containing the code for $43.99. It will be valid for one year.

            If you have any questions, please don't hesitate to reach out!

            YEEAAHHH!
            God Bless,
            Hodgetwins Customer Support

            239537:2332317

        ### **Example Output 2:**
            I didn't receive either order or code to use credit for the order that was returned.. (I just wanted the beanie from #SH409306)
            Thanks, and not sure why both show up fulfilled on my account.
    
        ### **Example Input 3:**
            Is there anyway I can just get my money back? I just went through the site trying to find something I liked to replace what I had already ordered and I couldn't find anything that I wanted that was my size and available. I fully support everything about Keith and Kevin and their businesses but at the end of the day what's right is right and returning my money that was spent over a month ago and I never received the order is the right thing to do. I'm not trying to come off rude at all but I wanted what I ordered not the same dollar amount of other products, if that were the case I would've ordered them all at once at the time. This is money that can go back into my pocket and I can spend on my daughter's Christmas. 
            Sent from my iPhone

            On Nov 11, 2024, at 11:05 AM, Hodgetwins Support <info@officialhodgetwins.com> wrote:
            
            Hello, Tony
            
            I'm reaching out with an important update regarding your recent order with us.
            
            Unfortunately, the Green 2XL item you requested is currently out of stock, and we won't be able to fulfill that portion of your order at this time. We completely understand how disappointing this must be, and we truly apologize for any inconvenience this may cause.
            
            In the meantime, we're issuing a store credit for the Green 2XL so that you can easily select another item or make future purchases with us. Your remaining items will be carefully packaged today and shipped out tomorrow, so you can expect to receive them soon. If this was the only item on your order, the store credit will be issued for the full amount of the order.
            
            We know how important this order is to you, and we're doing everything we can to ensure you still receive the rest of your items as quickly as possible. We sincerely appreciate your understanding and patience as we work to improve our stock and fulfillment process.
            
            If you have any further questions or if there's anything else we can assist with, please don't hesitate to reach out. We truly value your business and are committed to making this right for you.
            
            Thank you for your continued support.
            
            YEEAAHHH!
            God Bless,
            Hodgetwins Customer Support 
            
            299297:2332317

        ### **Example Output 3:**
            Is there anyway I can just get my money back? I just went through the site trying to find something I liked to replace what I had already ordered and I couldn't find anything that I wanted that was my size and available. I fully support everything about Keith and Kevin and their businesses but at the end of the day what's right is right and returning my money that was spent over a month ago and I never received the order is the right thing to do. I'm not trying to come off rude at all but I wanted what I ordered not the same dollar amount of other products, if that were the case I would've ordered them all at once at the time. This is money that can go back into my pocket and I can spend on my daughter's Christmas. 
            Sent from my iPhone

        
        ### **Example Input 4:**
            Yes that would be much appreciated.  

            Thanks 
            Sent from my iPhone

            On Nov 13, 2024, at 9:44 AM, Hodgetwins Support <info@officialhodgetwins.com> wrote:
            
            
            Hi Kurt!
            
            Per my previous statement, I can send store credit in the form of a gift card!
            If you are interested, just let me know!
            
            YEEAAHHH!
            God Bless,
            Hodgetwins Customer Support
            On Wed, 13 Nov at 9:27 AM , Kurt Sjolander <ksjolander04@gmail.com> wrote:
            Yes I kept the shirt and washed it. Not a bad shirt, just not the one I wanted.  
            Sent from my iPhone
            
            On Nov 11, 2024, at 8:22 AM, Hodgetwins Support <info@officialhodgetwins.com> wrote:
            
            
            Hello Kurt!
            
            So sorry to hear about your order!
            Have you kept and washed the shirt that was sent on accident?
            I can issue some store credit for you if you would like!
            Just let me know and I can get that processed for you!
            
            YEEAAHHH!
            God Bless,
            Hodgetwins Customer Support 
            
            299103:2332317


        ### **Example Output 4:**
            Yes that would be much appreciated.  

            Thanks 
`;
