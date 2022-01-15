## Space Gem ##
==================

This [React] app was initialized with [create-near-app]

Space Gem allows anyone to implement coworking programs by providing a solution that allows users to reserve work spaces and parking spots within any existing space.  The use of smart contracts simplifies the administration associated with coworking arrangements for both the operator and user while increasing security and efficiency.

Users will be able to select specific work spaces and parking spots based on preferences such as proximity to parking or amenities as well as specific work space and accessibility requirements.  The availability of real time occupancy data allows the user to avoid busy periods and confirm availability prior to departing for the office.  The optional ability to share locations within or outside of a friend group allows users to book spaces adjacent to coworkers or friends through verifiable user identities on the blockchain.

Operators are able to map existing facilities within Space Gem enabling a multitude of work spaces and parking spots to be reserved.  Specific capabilities within working spaces, such as conference rooms, specific IT equipment, washrooms, proximity to amenities, and accessible parking or workspaces may be highlighted within Space Gem enabling the user to query as desired. Verifiable user identities combined with smart contracts will improve the security of agreements while simplifying and automating administration.

Real time data analytics on availability, usage and transactions will enhance operators’ and end users’ decision making.  Operators will be able to better understand users requirements in order to adapt workspaces while users will be able to quickly and easily understand availability and usage patterns to optimize their coworking experience.  Users and operators will be able to access agreements and personal transactions securely and efficiently in a single location.  

Space Gem will simplify and increase the security associated with the administration and management of coworking facilities for the operator while incentivizing usage for the end user.  Built on trust, a blockchain solution will greatly enhance the experience associated with the rapidly growing trend of coworking arrangements by saving considerable time and effort for the user and operator.  The availability of analytics deriving from a single source of truth will serve as a permeable membrane to reduce unnecessary administration, duplication and inefficiency.  Space Gem will serve to greatly improve and enhance coworking digital platforms by leveraging the benefits of blockchain technology.


Quick Start
===========

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12
2. Install dependencies: `yarn install`
3. Run the local development server: `yarn dev` (see `package.json` for a
   full list of `scripts` you can run with `yarn`)

Now you'll have a local development environment backed by the NEAR TestNet!

Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.


Exploring The Code
==================

1. The "backend" code lives in the `/contract` folder. See the README there for
   more info.
2. The frontend code lives in the `/src` folder. `/src/index.html` is a great
   place to start exploring. Note that it loads in `/src/index.js`, where you
   can learn how the frontend connects to the NEAR blockchain.
3. Tests: there are different kinds of tests for the frontend and the smart
   contract. See `contract/README` for info about how it's tested. The frontend
   code gets tested with [jest]. You can run both of these at once with `yarn
   run test`.


Deploy
======

Every smart contract in NEAR has its [own associated account][NEAR accounts]. When you run `yarn dev`, your smart contract gets deployed to the live NEAR TestNet with a throwaway account. When you're ready to make it permanent, here's how.


Step 0: Install near-cli (optional)
-------------------------------------

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `yarn install`, but for best ergonomics you may want to install it globally:

    yarn install --global near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


Step 1: Create an account for the contract
------------------------------------------

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `space-gems.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `space-gems.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      near login

2. Create a subaccount (replace `YOUR-NAME` below with your actual account name):

      near create-account space-gems.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet


Step 2: set contract name in code
---------------------------------

Modify the line in `src/config.js` that sets the account name of the contract. Set it to the account id you used above.

    const CONTRACT_NAME = process.env.CONTRACT_NAME || 'space-gems.YOUR-NAME.testnet'


Step 3: deploy!
---------------

One command:

    yarn deploy

As you can see in `package.json`, this does two things:

1. builds & deploys smart contract to NEAR TestNet
2. builds & deploys frontend code to GitHub using [gh-pages]. This will only work if the project already has a repository set up on GitHub. Feel free to modify the `deploy` script in `package.json` to deploy elsewhere.


Troubleshooting
===============

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


  [React]: https://reactjs.org/
  [create-near-app]: https://github.com/near/create-near-app
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [jest]: https://jestjs.io/
  [NEAR accounts]: https://docs.near.org/docs/concepts/account
  [NEAR Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [gh-pages]: https://github.com/tschaub/gh-pages
