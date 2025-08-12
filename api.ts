The Fix You Need
Your Apigee API proxy needs to be configured to allow and handle OPTIONS requests. Here's what to do:
1. In Apigee Edge UI:
Go to your eap-oauth API proxy
Click Develop tab
Look for the Policies section
2. Add CORS Policy:
<CORS>
    <DisplayName>CORS Policy</DisplayName>
    <Add>
        <Headers>
            <Header>Access-Control-Allow-Origin</Header>
            <Header>Access-Control-Allow-Methods</Header>
            <Header>Access-Control-Allow-Headers</Header>
            <Header>Access-Control-Max-Age</Header>
        </Headers>
    </Add>
    <Set>
        <Headers>
            <Header name="Access-Control-Allow-Origin">http://localhost:5000</Header>
            <Header name="Access-Control-Allow-Methods">GET, POST, OPTIONS</Header>
            <Header name="Access-Control-Allow-Headers">Content-Type, Authorization, x-apikey</Header>
            <Header name="Access-Control-Max-Age">86400</Header>
        </Headers>
    </Set>
</CORS>

3. Handle OPTIONS Method:
Add a conditional flow specifically for OPTIONS requests:
<Flow name="Options">
    <Request>
        <Step>
            <Name>CORS-Policy</Name>
        </Step>
    </Request>
    <Response>
        <Step>
            <Name>CORS-Policy</Name>
        </Step>
    </Response>
    <Condition>request.verb == "OPTIONS"</Condition>
</Flow>
