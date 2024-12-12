export type GovernanceProposal = {
  tx_hash: string;
  cert_index: number;
  governance_type: string;
};

export type GovernanceProposalBody = {
  title: string;
  comment: string;
  abstract: string;
  rationale: string;
  motivation: string;
  references?: string;
  externalUpdates?: string;
};

export type GovernanceProposalAuthor = {
  name: string;
  witness: Object[];
};

export type GovernanceProposalMetadata = {
  json_metadata: {
    body: GovernanceProposalBody;
    authors: GovernanceProposalAuthor[];
  };
};
