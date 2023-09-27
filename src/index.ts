import {
    blob,
    ic,
    nat64,
    Opt,
    Principal,
    $query,
    Record,
    Result,
    StableBTreeMap,
    $update,
    Variant,
    Vec,
    match
} from 'azle';

type User = Record<{
    id: Principal;
    createdAt: nat64;
    recordingIds: Vec<Principal>;
    proposalIds: Vec<Principal>;
    votes: Vec<Vote>;
    username: string;
}>;


type Proposal = Record<{
    id: Principal;
    votes: Vec<Vote>;
    createdAt: nat64;
    name: string;
    description: string;
    isAccepted: boolean;
    userId: Principal;
}>;



type Vote = Record<{
    id: Principal;
    voterId: Principal;
    proposalId: Principal;
    voteType: boolean;
    createdAt: nat64;
}>;

let users = new StableBTreeMap<Principal, User>(0, 38, 100_000);
let proposals = new StableBTreeMap<Principal, Proposal>(1, 38, 5_000_000);
let votes = new StableBTreeMap<Principal, Vote>(2, 38, 5_000_000);

$update;
export function createUser(username: string): User {
    const id = generateId();
    const user: User = {
        id,
        createdAt: ic.time(),
        recordingIds: [],
        proposalIds: [],
        votes : [],
        username
    };

    users.insert(user.id, user);

    return user;
}

$update;
export function deleteUser(id: Principal): Result<
    User,
    Variant<{
        UserDoesNotExist: Principal;
    }>
> {
    const user = users.get(id);

    return match(user, {
        Some: (user) => {
            user.recordingIds.forEach((recordingId) => {
                recordings.remove(recordingId);
            });
            user.proposalIds.forEach((proposalId) => {
                proposals.remove(proposalId);
            });
            user.votesId.forEach((votesId) => {
                proposals.remove(votesId);
            });

            users.remove(user.id);

            return {
                Ok: user
            };
        },
        None: () => {
            return {
                Err: {
                    UserDoesNotExist: id
                }
            };
        }
    });
}

//create proposal
$update;
export function createProposal(
    name: string,
    description: string,
    userId: Principal
): Result<
    Proposal,
    Variant<{
        UserDoesNotExist: Principal;
    }>
> {
    const user = users.get(userId);
    

    return match(user, {
        Some: (user) => {
            const id = generateId();
            const proposal: Proposal = {
                id,
                name,
                createdAt: ic.time(),
                description,
                isAccepted: false,
                votes: [],
                userId
            };

            proposals.insert(proposal.id, proposal);

            const updatedUser: User = {
                ...user,
                proposalIds: [...user.proposalIds, proposal.id]
            };

            users.insert(updatedUser.id, updatedUser);

            return {
                Ok: proposal
            };
        },
        None: () => {
            return {
                Err: {
                    UserDoesNotExist: userId
                }
            };
        }
    });
}



$query;
export function readUsers(): Vec<User> {
    return users.values();
}

$query;
export function readVotes(): Vec<Vote> {
    return votes.values();
}
$query;
export function readProposals(): Vec<Proposal> {
    return proposals.values();
}

$query;
export function readVotesById(id: Principal): Opt<Vote> {
    return votes.get(id);
}

$query;
export function readProposalById(id: Principal): Opt<Proposal> {
    return proposals.get(id);
}
$query;
export function readUserById(id: Principal): Opt<User> {
    return users.get(id);
}

$update;
export function vote(
    proposalId: Principal,
    voterId : Principal,
    voteType: boolean,
): Result<
    Proposal,
    Variant<{
        ProposalDoesNotExist: Principal;
        UserDoesNotExist: Principal;
    }>
> {
    const proposal = proposals.get(proposalId);
    const user = users.get(voterId);

    return match(proposal, {
        Some: (proposal) => {
            return match(user, {
                Some: (user) => {
                    const id = generateId();
                    const vote: Vote = {
                        id,
                        voterId,
                        createdAt: ic.time(),
                        voteType,
                        proposalId,
                    };

                    votes.insert(vote.id, vote);

                    const updatedVotes = [...proposal.votes, vote];
                    const updatedUserVotes = [...user.votes, vote];

                    const updatedProposal: Proposal = {
                        ...proposal,
                        votes: updatedVotes,
                        isAccepted:voteType,
                    };
                    const updatedUser: User = {
                        ...user,
                        votes: updatedUserVotes
                    };

                    users.insert(updatedUser.id, updatedUser);

                    proposals.insert(updatedProposal.id, updatedProposal);

                    return {
                        Ok: updatedProposal
                    };
                },
                None: () => {
                    return {
                        Err: {
                            UserDoesNotExist: voterId
                        }
                    };
                }
            });
        },
        None: () => {
            return {
                Err: {
                    ProposalDoesNotExist: proposalId
                }
            };
        }
    });
}


$update;
export function deleteProposal(id: Principal): Result<
    Proposal,
    Variant<{
        ProposalDoesNotExist: Principal;
        UserDoesNotExist: Principal;
    }>
> {
    const proposal = proposals.get(id);

    return match(proposal, {
        Some: (proposal) => {
            const user = users.get(proposal.userId);

            return match(user, {
                Some: (user) => {
                    const updatedUser: User = {
                        ...user,
                        proposalIds: user.proposalIds.filter(
                            (proposalId) =>
                            proposalId.toText() !== proposal.id.toText()
                        )
                    };

                    users.insert(updatedUser.id, updatedUser);

                    proposals.remove(id);

                    return {
                        Ok: proposal
                    };
                },
                None: () => {
                    return {
                        Err: {
                            UserDoesNotExist: proposal.userId
                        }
                    };
                }
            });
        },
        None: () => {
            return {
                Err: {
                    ProposalDoesNotExist: id
                }
            };
        }
    });
}

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
