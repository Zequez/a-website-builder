import { PORT } from '../dist/ts/server/config.js';
import app from '../dist/ts/server/app.js';

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

export default app;
