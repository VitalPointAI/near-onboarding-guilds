import * as nearApiJs from 'near-api-js'

class CatalystDAO {

    constructor(){}

    async initDaoContract(account, contractId) {
        //initialize DAO Contract
        const daocontract = new nearApiJs.Contract(account, contractId, {
            viewMethods: [
                'getMemberProposalVote',
                'getInit',
                'getCurrentPeriod',
                'getSummoner',
                'getProposalFlags',
                'getGuildTokenBalances',
                'getEscrowTokenBalances',
                'getInitSettings',
                'getMemberStatus',
                'getProposalVotes',
                'getMemberInfo',
                'getProposalDeposit',
                'getDepositToken',
                'getPeriodDuration',
                'getMemberShares',
                'getMemberLoot',
                'getTotalShares',
                'getProposalsLength',
                'getTotalMembers',
                'getProposal',
                'getDonation',
                'getSummonTime',
                'getDonationsLength',
                'getCurrentShare',
                'getDelegationInfo',
                'getNeededVotes',
                'getRemainingDelegates',
                'getPlatformAccount',
                'getPlatformPercentage',
                'getApprovedTokens'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
                'init',
                'setInit',
                'withdrawBalance',
                'submitWhitelistProposal',
                'submitGuildKickProposal',
                'submitMemberProposal',
                'submitCommitmentProposal',
                'submitOpportunityProposal',
                'submitTributeProposal',
                'submitConfigurationProposal',
                'submitCommunityRoleProposal',
                'submitAssignRoleProposal',
                'submitReputationFactorProposal',
                'submitPayoutProposal',
                'sponsorProposal',
                'submitVote',
                'processProposal',
                'processWhitelistProposal',
                'processGuildKickProposal',
                'ragequit',
                'cancelProposal',
                'makeDonation',
                'leave',
                'delegate',
                'undelegate',
                'changeAmount'

            ]
            });

            return daocontract
    }
    
}

export const catalystDao = new CatalystDAO()