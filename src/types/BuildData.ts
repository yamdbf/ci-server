/**
 * Represents data to be passed to a new `Build`
 */
export interface BuildData
{
	repo: string;
	sha: string;
	token: string;
	context: string;
	description: string;
	target_url: string;
}
