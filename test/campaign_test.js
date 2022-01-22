const assert = require("assert")
const ganache = require("ganache-cli")
const Web3 =  require("web3")
const web3 =  new Web3(ganache.provider());
const compiledFactory = require("../ethereum/build/CampaignFactory.json")
const compiledCampaign = require("../ethereum/build/Campaign.json")

let accounts
let factory 
let campaignAddress
let campaign


beforeEach(async() => {
    accounts = await web3.eth.getAccounts()

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data: compiledFactory.bytecode })
        .send({from: accounts[0], gas: "1000000"})

    // .send() does not return an address/other info 
    await factory.methods.createCampaign("100").send({
        from: accounts[0], 
        gas: "1000000"
    })
    //.call() when no data is being changed
    const addresses = await factory.methods.getDeployedCampaigns().call()
    campaignAddress = addresses[0]

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface), 
        campaignAddress
    )
}) 

    describe("Campaigns",() => {
        it("deploys a factory and campaign",  () => {
            assert.ok(factory.options.address)
            assert.ok(campaign.options.address)
        })
        
        it("marks caller as the campaign manager", async () => {
            const manager = await campaign.methods.manager().call()
            assert.equal(accounts[0], manager)
        })
        it("allows people to contribue and marks them as approvers", async () => {
            await campaign.methods.contribute().send({
                value: 200,
                from: accounts[1]
            })
            const isContributor = await campaign.methods.approvers(accounts[1])
            assert(isContributor)
            
        })
            
    })
    