// use anchor_lang::prelude::*;
// use anchor_spl::{
//     associated_token::AssociatedToken,
//     metadata::{MasterEditionAccount, Metadata, MetadataAccount},
//     token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
// };

// use crate::state::{Listing, Marketplace};

// #[derive(Accounts)]
// pub struct List<'info> {
//     #[account(mut)]
//     pub maker: Signer<'info>,

//     pub mint: InterfaceAccount<'info, Mint>,

//     #[account(
//         seeds = [b"marketplace", marketplace.name.as_str().as_bytes()],
//         bump = marketplace.bump,
//     )]
//     pub marketplace: Account<'info, Marketplace>,

//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = maker,
//         associated_token::token_program = token_program
//     )]
//     pub maker_ata: InterfaceAccount<'info, TokenAccount>,

//     #[account(
//         init,
//         payer = maker,
//         associated_token::mint = mint,
//         associated_token::authority = listing,
//         associated_token::token_program = token_program
//     )]
//     pub vault_ata: InterfaceAccount<'info, TokenAccount>,

//     #[account(
//         init,
//         payer = maker,
//         seeds = [b"list", marketplace.key().as_ref(), mint.key().as_ref()],
//         space = 8 + Listing::INIT_SPACE,
//         bump
//     )]
//     pub listing: Account<'info, Listing>,

//     pub collection_mint: InterfaceAccount<'info, Mint>,

//     #[account(
//         seeds = [
//             b"metadata",
//             metadata_program.key().as_ref(),
//             mint.key().as_ref(),
//         ],
//         seeds::program = metadata_program.key(),
//         bump,
//         constraint = metadata.collection.as_ref().unwrap().key.as_ref() == collection_mint.key().as_ref(),
//         constraint = metadata.mint.key() == mint.key(),
//     )]
//     pub metadata: Account<'info, MetadataAccount>,

//     #[account(
//         seeds = [
//             b"metadata",
//             metadata_program.key().as_ref(),
//             mint.key().as_ref(),
//             b"edition"
//         ],
//         seeds::program = metadata_program.key(),
//         bump
//     )]
//     pub edition: Account<'info, MasterEditionAccount>,

//     pub metadata_program: Program<'info, Metadata>,
//     pub system_program: Program<'info, System>,
//     pub token_program: Interface<'info, TokenInterface>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
// }

// impl<'info> List<'info> {
//     pub fn create_listing(&mut self, price: u64, bumps: &ListBumps) -> Result<()> {
//         self.listing.set_inner(Listing {
//             maker: self.maker.key(),
//             mint: self.mint.key(),
//             price,
//             bump: bumps.listing,
//         });

//         Ok(())
//     }

//     pub fn list_nft(&mut self) -> Result<()> {
//         let cpi_program = self.token_program.to_account_info();

//         let cpi_accounts = TransferChecked {
//             from: self.maker_ata.to_account_info(),
//             mint: self.mint.to_account_info(),
//             to: self.vault_ata.to_account_info(),
//             authority: self.maker.to_account_info(),
//         };

//         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

//         transfer_checked(cpi_ctx, 1, 0)?;
//         Ok(())
//     }
// }
