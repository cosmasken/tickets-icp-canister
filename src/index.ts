// Import necessary modules and dependencies.
import {
  blob,
  ic,
  nat64,
  nat32,
  Opt,
  Principal,
  $query,
  Record,
  Result,
  StableBTreeMap,
  $update,
  Variant,
  Vec,
  match,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Define a TypeScript type for a User record.
type User = Record<{
  id: string;
  createdAt: nat64;
  recordingIds: Vec<string>;
  proposalIds: Vec<string>;
  votes: Vec<Vote>;
  username: string;
}>;

// Define a TypeScript type for a Proposal record.
type Proposal = Record<{
  id: string;
  votes: Vec<Vote>;
  createdAt: nat64;
  name: string;
  description: string;
  noOfVotes: nat32;
  userId: string;
}>;

// Define a TypeScript type for a Vote record.
type Vote = Record<{
  id: string;
  voterId: string;
  proposalId: string;
  voteType: boolean;
  createdAt: nat64;
}>;

// Create StableBTreeMap instances to store User, Proposal, and Vote objects.
let users = new StableBTreeMap<string, User>(0, 44, 1024);
let proposals = new StableBTreeMap<string, Proposal>(1, 44, 1024);
let votes = new StableBTreeMap<string, Vote>(2, 44, 1024);

$update; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to create a new User.
export function createUser(username: string): Result<User, string> {
  // Validate username.
  if (!username || username.length < 2 || username.length > 20) {
    return Result.Err<User, string>("Invalid username");
  }

  // Check if the username already exists.
  if (users.values().some((u) => u.username === username)) {
    return Result.Err<User, string>("Username already exists");
  }

  // Create a new User object.
  const user: User = {
    id: uuidv4(),
    createdAt: ic.time(),
    recordingIds: [],
    proposalIds: [],
    votes: [],
    username,
  };

  try {
    // Insert the new User into storage.
    users.insert(user.id, user);
    return Result.Ok<User, string>(user);
  } catch (error) {
    return Result.Err<User, string>("Failed to create user");
  }
}

$update; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to delete a User by their ID.
export function deleteUser(id: string): Result<User, string> {
  try {
    const user = users.get(id);

    return match(user, {
      Some: (user) => {
        // Remove associated proposals.
        user.proposalIds.forEach((proposalId) => {
          try {
            proposals.remove(proposalId);
          } catch (error) {
            throw new Error(
              `Error removing proposal id=${proposalId}: ${error}`
            );
          }
        });

        try {
          // Remove the User.
          users.remove(user.id);
        } catch (error) {
          throw new Error(`Error removing user id=${user.id}: ${error}`);
        }

        return Result.Ok<User, string>(user);
      },
      None: () => Result.Err<User, string>(`Cannot Delete this User id=${id}.`),
    });
  } catch (error) {
    return Result.Err<User, string>(`Error deleting user id=${id}: ${error}`);
  }
}

// Function to create a new Proposal.
$update; // This appears to be an annotation, but it doesn't have a corresponding comment.
export function createProposal(
  name: string,
  description: string,
  userId: string
): Result<Proposal, string> {
  // Validate input parameters.
  if (!name || !description || !userId) {
    return Result.Err<Proposal, string>(`Invalid input parameters.`);
  }

  try {
    const user = users.get(userId);

    return match(user, {
      Some: (user) => {
        // Generate a unique ID for the Proposal.
        const id = uuidv4();
        const proposal: Proposal = {
          id,
          name,
          createdAt: ic.time(),
          description,
          noOfVotes: 0,
          votes: [],
          userId,
        };

        // Update the User's proposalIds with the new Proposal ID.
        const updatedUser: User = {
          ...user,
          proposalIds: [...user.proposalIds, proposal.id],
        };

        // Insert the updated User into storage.
        users.insert(updatedUser.id, updatedUser);

        // Insert the Proposal into storage.
        proposals.insert(proposal.id, proposal);

        return Result.Ok<Proposal, string>(proposal);
      },
      None: () =>
        Result.Err<Proposal, string>(
          `Cannot create proposal with this User id.`
        ),
    });
  } catch (error) {
    return Result.Err<Proposal, string>(
      `Error occurred while creating the proposal: ${error}`
    );
  }
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to retrieve all Users.
export function getAllUsers(): Result<Vec<User>, string> {
  try {
    return Result.Ok(users.values());
  } catch (error) {
    return Result.Err(`Failed to fetch users: ${error}`);
  }
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to retrieve all Votes.
export function getAllVotes(): Result<Vec<Vote>, string> {
  try {
    return Result.Ok(votes.values());
  } catch (error) {
    return Result.Err(`Failed to fetch votes: ${error}`);
  }
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to retrieve all Proposals.
export function getAllProposals(): Result<Vec<Proposal>, string> {
  try {
    return Result.Ok(proposals.values());
  } catch (error) {
    return Result.Err(`Failed to fetch proposals: ${error}`);
  }
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to get a Vote by its ID.
export function getVoteById(voterId: string): Opt<Vote> {
  if (!voterId) {
    throw new Error("Invalid voterId parameter");
  }
  const vote = votes.get(voterId);
  if (!vote) {
    throw new Error("Vote not found");
  }
  return vote;
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to get a Proposal by its ID.
export function getProposalById(id: string): Opt<Proposal> {
  // Validate the input id.
  if (!id || typeof id !== "string") {
    throw new Error("Invalid proposal ID");
  }
  const proposal = proposals.get(id);
  if (!proposal) {
    throw new Error("Proposal not found");
  }
  return proposal;
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to retrieve a User by their ID.
export function readUserById(id: string): Opt<User> {
  // Validate the input id.
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID");
  }
  const user = users.get(id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return user;
}

$query; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to retrieve Proposal details by ID.
export function viewProposalDetails(id: string): Opt<Proposal> {
  const proposal = proposals.get(id);
  if (!proposal) {
    throw new Error("Proposal not found");
  }
  return proposal;
}

$update; // This appears to be an annotation, but it doesn't have a corresponding comment.

// Function to vote on a Proposal.
export function voteProposal(
  proposalId: string,
  voterId: string,
  voteType: boolean
): Result<Proposal, string> {
  const proposal = proposals.get(proposalId);
  const user = users.get(voterId);

  return match(proposal, {
    Some: (proposal) => {
      // Check if the user has already voted for this proposal.
      return match(user, {
        Some: (user) => {
          // Generate a unique ID for the Vote.
          const id = uuidv4();
          const vote: Vote = {
            id,
            voterId,
            createdAt: ic.time(),
            voteType,
            proposalId,
          };

          // Insert the new Vote into storage.
          votes.insert(vote.id, vote);

          // Update Proposal and User objects with the new Vote.
          const updatedVotes = [...proposal.votes, vote];
          const updatedUserVotes = [...user.votes, vote];

          const updatedProposal: Proposal = {
            ...proposal,
            votes: updatedVotes,
            noOfVotes: proposal.noOfVotes + 1,
          };
          const updatedUser: User = {
            ...user,
            votes: updatedUserVotes,
          };

          // Update User and Proposal in storage.
          users.insert(updatedUser.id, updatedUser);
          proposals.insert(updatedProposal.id, updatedProposal);

          return Result.Ok<Proposal, string>(updatedProposal);
        },
        None: () =>
          Result.Err<Proposal, string>(
            `User does not exist by this User id=${voterId}.`
          ),
      });
    },
    None: () =>
      Result.Err<Proposal, string>(
        `Proposal with id=${proposalId} does not exist.`
      ),
  });
}


// Define a global crypto object with a getRandomValues method.
globalThis.crypto = {
  //@ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
