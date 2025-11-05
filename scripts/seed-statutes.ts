import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏛️  Seeding statute pages...')

  // Find admin user to set as author
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@sahakumkhmer.se' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Please run seed-admin.ts first.')
  }

  // English Statutes Content
  const englishContent = `
<h2>Purpose</h2>
<p>Sahakum Khmer is a non-profit association established to support Cambodians living in Sweden in their integration into society. The association strives to build a welcoming and inclusive community by helping individuals adapt to Swedish society, pursue meaningful careers, and maintain a strong connection to their Cambodian heritage. Through cultural exchange, educational initiatives, and shared activities—such as traditional cooking, cultural exhibitions, language practice, and workshops—Sahakum Khmer promotes both personal development and collective empowerment.</p>

<h2>Mission</h2>
<p>To empower the Cambodian community in Sweden—especially women in intercultural marriages and students—by promoting cultural integration, personal growth, and career development.</p>

<h2>Vision</h2>
<p>To build a strong and inclusive Cambodian community in Sweden that celebrates cultural heritage, supports integration, and empowers individuals to thrive socially and professionally fulfilled.</p>

<h2>Example Activities</h2>
<ul>
  <li>Khmer New Year celebrations</li>
  <li>Traditional cooking workshops</li>
  <li>Cultural exhibitions and performances</li>
  <li>Swedish language support and tutoring</li>
  <li>Community gatherings, workshops and networking events</li>
  <li>Support the newcomers, including sharing experiences related to education, career opportunities, and adapting to life in Sweden</li>
</ul>

<h2>Statutes</h2>

<h3>§1 Name</h3>
<p>The name of the association is <strong>Sahakum Khmer</strong>.</p>
<p>The association's registered address is: <strong>Törnerosgatanattan 4B, 633 43 ESKILSTUNA</strong></p>

<h3>§2 Purpose</h3>
<p>Sahakum Khmer is a non-profit association established to support Cambodians living in Sweden in their integration into society. The association strives to build a welcoming and inclusive community by helping individuals adapt to Swedish society, pursue meaningful careers, and maintain a strong connection to their Cambodian heritage. Through cultural exchange, educational initiatives, and shared activities—such as traditional cooking, cultural exhibitions, language practice, and workshops—Sahakum Khmer promotes both personal development and collective empowerment.</p>

<h3>§3 Membership</h3>
<p><strong>3.1</strong> Membership is open to individuals aged 18 and above who support the association's purpose and statutes.</p>
<p><strong>3.2</strong> No annual membership fee is required at present. Voluntary contributions may be introduced for specific activities, subject to approval by the board.</p>
<p><strong>3.3</strong> Membership applications must be submitted through the association's official web application form at https://www.sahakumkhmer.se/en/join and approved by majority decision of the board.</p>
<p><strong>3.4</strong> Members must respect the association's rules and values, including adherence to Swedish anti-discrimination law and a zero-tolerance policy against discrimination, harassment, or prejudicial treatment based on gender, ethnicity, religion or belief, disability, sexual orientation, age, transgender identity or expression, or any other protected characteristics.</p>
<p><strong>3.5</strong> Members who violate these statutes or the association's values may be excluded by majority decision of the board after being given opportunity to respond.</p>
<p><strong>3.6</strong> Excluded members have the right to appeal in writing within 30 days. The board shall review the appeal and make a decision within 30 days of receiving it.</p>
<p><strong>3.7</strong> Membership terminates upon death, resignation, exclusion, or dissolution of the association.</p>

<h3>§4 Board of Directors</h3>
<p><strong>4.1</strong> The board shall consist of at least three (3) members: a chairperson and at least two (2) other members.</p>
<p><strong>4.2</strong> The board may also include up to two (2) deputy members.</p>
<p><strong>4.3</strong> Board members are elected at the annual meeting for a term of one (1) year.</p>
<p><strong>4.4</strong> The board is responsible for the association's activities, finances, and administration according to these statutes and decisions made by the general meeting.</p>
<p><strong>4.5</strong> The board shall meet when needed, but at least twice per year. Additional meetings may be convened when necessary.</p>
<p><strong>4.6</strong> The board has quorum when at least half of the elected members are present.</p>
<p><strong>4.7</strong> Board decisions require simple majority. In case of tie, the chairperson has the deciding vote.</p>

<h3>§5 Volunteers</h3>
<p><strong>5.1</strong> All volunteers shall be approved by the board.</p>
<p><strong>5.2</strong> Individual board members are not authorized to appoint volunteers or assign tasks without the board's collective decision, to ensure fairness and transparency.</p>
<p><strong>5.3</strong> Volunteers must support the association's purpose and comply with these statutes.</p>
<p><strong>5.4</strong> The board may assign volunteers to specific projects, events, or ongoing activities as needed.</p>
<p><strong>5.5</strong> Project leaders or event coordinators may be designated by the board to supervise volunteer activities.</p>
<p><strong>5.6</strong> Volunteers may be reimbursed for pre-approved expenses directly related to their volunteer work, subject to proper documentation and receipts.</p>
<p><strong>5.7</strong> The board reserves the right to reassign or terminate volunteer arrangements with reasonable notice if performance expectations are not met or if statutes are violated.</p>
<p><strong>5.8</strong> Volunteers are expected to represent the association professionally during projects and events.</p>

<h3>§6 General Meetings</h3>
<p><strong>6.1</strong> The annual meeting is the association's highest decision-making body.</p>
<p><strong>6.2</strong> The annual meeting shall be held once per year, no later than June 30</p>
<p><strong>6.3</strong> Notice of annual meeting must be sent to all members at least four (4) weeks in advance</p>
<p><strong>6.4</strong> Extraordinary meetings may be called by the board or upon written request by at least one-third of the members.</p>
<p><strong>6.5</strong> Notice of extraordinary meetings must be sent at least two (2) weeks in advance.</p>
<p><strong>6.6</strong> All members have equal voting rights. Decisions require simple majority unless otherwise stated in these statutes.</p>
<p><strong>6.7</strong> For valid decisions, at least one-third of the members must be present (quorum).</p>

<h3>§7 Annual Meeting Agenda</h3>
<p>The annual meeting shall address:</p>
<ol>
  <li>Opening of the meeting</li>
  <li>Election of meeting chairperson and secretary</li>
  <li>Approval of notice and agenda</li>
  <li>Annual report from the board</li>
  <li>Financial report</li>
  <li>Decision on discharge of liability for the board</li>
  <li>Election of board members and any deputy members</li>
  <li>Election of auditor (if required)</li>
  <li>Budget for the coming year</li>
  <li>Membership fees and contributions (if any)</li>
  <li>Other matters submitted to the board in writing at least two weeks before the meeting</li>
  <li>Closing of the meeting</li>
</ol>

<h3>§8 Financial Management</h3>
<p><strong>8.1</strong> The association's financial year follows the calendar year (January 1 - December 31).</p>
<p><strong>8.2</strong> The board manages the association's finances responsibly.</p>
<p><strong>8.3</strong> All financial transactions shall be conducted through the association's bank account.</p>

<h4>§8.4 Inward Remittances</h4>
<p><strong>8.4.1</strong> All inward remittances must be approved by unanimous agreement of all board members before being accepted as association income and must be supported by proper documentation and a written proposal.</p>
<p><strong>8.4.2</strong> Board members must be notified of all incoming transfers and given reasonable time to review and approve.</p>
<p><strong>8.4.3</strong> Inward remittances must align with the association's purpose and comply with applicable laws.</p>
<p><strong>8.4.4</strong> Board approval must be documented in meeting minutes or written resolution.</p>

<h4>§8.5 Outward Remittances</h4>
<p><strong>8.5.1</strong> All outward remittances, including donations and grants, require board approval prior to disbursement and must be supported by proper documentation and a written proposal.</p>
<p><strong>8.5.2</strong> Each outward remittance must be supported by proper documentation and a written proposal detailing:</p>
<ul>
  <li>The purpose and recipient</li>
  <li>The amount and justification</li>
  <li>How the transfer aligns with the association's mission</li>
</ul>
<p><strong>8.5.3</strong> Board approval must be documented in meeting minutes or written resolution.</p>

<h4>§8.6 Expense Approval Procedure</h4>
<p>Expense claims, such as transportation or train tickets, must be accompanied by valid supporting receipts.</p>

<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th>Amount Range (SEK)</th>
      <th>Initiated By</th>
      <th>Approval Required</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1 - 500</td>
      <td>Finance Officer</td>
      <td>Chairman (1)</td>
    </tr>
    <tr>
      <td>500 - 3,000</td>
      <td>Finance Officer</td>
      <td>Chairman (1) and one Board member</td>
    </tr>
    <tr>
      <td>Over 3,000</td>
      <td>Finance Officer</td>
      <td>Entire Board including the Chairman</td>
    </tr>
  </tbody>
</table>

<p><strong>8.7</strong> The association's funds shall be deposited in a bank account in the association's name.</p>
<p><strong>8.8</strong> Annual financial accounts shall be presented at the annual meeting.</p>
<p><strong>8.9</strong> The Finance officer, or a person appointed by the board, shall prepare and update the monthly account statement.</p>
<p><strong>8.10</strong> The statement must be completed no later than the second day after the end of each month.</p>
<p><strong>8.11</strong> The statement shall be presented to the Chairperson.</p>
<p><strong>8.12</strong> The statement shall be made available to the board, and to members upon request.</p>

<h3>§9 Auditing</h3>
<p><strong>9.1</strong> If the association's annual turnover exceeds 3 million SEK, or if requested by members representing at least 10% of the membership, an auditor shall be elected.</p>
<p><strong>9.2</strong> The auditor's term is one year.</p>
<p><strong>9.3</strong> The auditor shall review the association's accounts and administration.</p>

<h3>§10 Amendments to the Statutes</h3>
<p><strong>10.1</strong> Proposals for amendments must be submitted in writing to the board at least four (4) weeks before the annual or extraordinary meeting.</p>
<p><strong>10.2</strong> Amendments require a two-thirds (2/3) majority vote of the members present at the meeting.</p>
<p><strong>10.3</strong> Amendments take effect immediately upon adoption unless otherwise decided.</p>

<h3>§11 Dissolution of the Association</h3>
<p><strong>11.1</strong> Dissolution can only be decided at two consecutive general meetings with at least two months between them.</p>
<p><strong>11.2</strong> Each meeting must approve dissolution with a two-thirds (2/3) majority vote.</p>
<p><strong>11.3</strong> Upon dissolution, the association's assets shall be donated to a non-profit organization with similar goals, as decided by the final meeting.</p>
<p><strong>11.4</strong> All documentations shall be preserved according to applicable laws.</p>

<h3>§12 Conflicts and Interpretation</h3>
<p><strong>12.1</strong> Disputes regarding the interpretation of these statutes shall be resolved by the board.</p>
<p><strong>12.2</strong> If a member disagrees with the board's interpretation, the matter may be brought to the next general meeting for final decision.</p>

<h3>§13 Compliance with Law</h3>
<p><strong>13.1</strong> The association shall comply with all applicable Swedish laws and regulations.</p>
<p><strong>13.2</strong> These statutes are supplemented by Swedish association law where not otherwise specified.</p>

<hr>
<p><em>Date of adoption: [dd/mm/yyyy]</em><br>
<em>Place of adoption: [City, Sweden]</em><br>
<em>Contact: contact.sahakumkhmer.se@gmail.com</em><br>
<em>Website: <a href="https://www.sahakumkhmer.se">https://www.sahakumkhmer.se</a></em></p>
`

  // Swedish Stadgar Content
  const swedishContent = `
<h2>Syfte</h2>
<p>Sahakum Khmer är en ideell förening som grundats för att stödja kambodjaner som bor i Sverige i deras integration i samhället. Föreningen strävar efter att bygga ett välkomnande och inkluderande samhälle genom att hjälpa individer att anpassa sig till det svenska samhället, söka meningsfulla karriärer och bibehålla en stark koppling till sitt kambodjanska arv. Genom kulturutbyte, utbildningsinitiativ och gemensamma aktiviteter — såsom traditionell matlagning, kulturutställningar, språköva och workshops — främjar Sahakum Khmer både personlig utveckling och kollektiv egenmakt.</p>

<h2>Uppdrag</h2>
<p>Att stärka den kambodjanska gemenskapen i Sverige — särskilt kvinnor i interkulturella äktenskap och studenter — genom att främja kulturell integration, personlig utveckling och karriärutveckling.</p>

<h2>Vision</h2>
<p>Att bygga en stark och inkluderande kambodjansk gemenskap i Sverige som firar kulturarv, stödjer integration och ger individer möjlighet att blomstra socialt och professionellt uppfyllt.</p>

<h2>Exempelaktiviteter</h2>
<ul>
  <li>Khmer nyårsfirande</li>
  <li>Traditionella matlagningsworkshops</li>
  <li>Kulturutställningar och föreställningar</li>
  <li>Stöd för svenska språket och handledning</li>
  <li>Gemenskapssamlingar, workshops och nätverksevenemang</li>
  <li>Stödja nyanlända, inklusive delning av erfarenheter relaterade till utbildning, karriärmöjligheter och anpassning till livet i Sverige</li>
</ul>

<h2>Stadgar</h2>

<h3>§1 Namn</h3>
<p>Föreningens namn är <strong>Sahakum Khmer</strong>.</p>
<p>Föreningens registrerade adress är: <strong>Törnerosgatanen 4B, 633 43 ESKILSTUNA</strong></p>

<h3>§2 Syfte</h3>
<p>Sahakum Khmer är en ideell förening som grundats för att stödja kambodjaner som bor i Sverige i deras integration i samhället. Föreningen strävar efter att bygga ett välkomnande och inkluderande samhälle genom att hjälpa individer att anpassa sig till det svenska samhället, söka meningsfulla karriärer och bibehålla en stark koppling till sitt kambodjanska arv. Genom kulturutbyte, utbildningsinitiativ och gemensamma aktiviteter — såsom traditionell matlagning, kulturutställningar, språköva och workshops — främjar Sahakum Khmer både personlig utveckling och kollektiv egenmakt.</p>

<h3>§3 Medlemskap</h3>
<p><strong>3.1</strong> Medlemskap är öppet för individer 18 år och äldre som stödjer föreningens syfte och stadgar.</p>
<p><strong>3.2</strong> Ingen årlig medlemsavgift krävs för närvarande. Frivilliga bidrag kan införas för specifika aktiviteter, med godkännande av styrelsen.</p>
<p><strong>3.3</strong> Medlemsansökningar måste lämnas in via föreningens officiella webbansökningsformulär på https://www.sahakumkhmer.se/en/join och godkännas genom majoritetsbeslut av styrelsen.</p>
<p><strong>3.4</strong> Medlemmar måste respektera föreningens regler och värderingar, inklusive efterlevnad av svensk antidiskrimineringslagstiftning och en nolltoleranspolicy mot diskriminering, trakasserier eller fördömsfull behandling baserad på kön, etnicitet, religion eller övertygelse, funktionsnedsättning, sexuell läggning, ålder, transpersoners identitet eller uttryck, eller andra skyddade egenskaper.</p>
<p><strong>3.5</strong> Medlemmar som bryter mot dessa stadgar eller föreningens värderingar kan uteslutas genom majoritetsbeslut av styrelsen efter att ha getts möjlighet att svara.</p>
<p><strong>3.6</strong> Uteslutna medlemmar har rätt att överklaga skriftligen inom 30 dagar. Styrelsen ska granska överklagandet och fatta ett beslut inom 30 dagar efter att ha mottagit det.</p>
<p><strong>3.7</strong> Medlemskap upphör vid dödsfall, utträde, uteslutning eller upplösning av föreningen.</p>

<h3>§4 Styrelse</h3>
<p><strong>4.1</strong> Styrelsen ska bestå av minst tre (3) medlemmar: en ordförande och minst två (2) andra medlemmar.</p>
<p><strong>4.2</strong> Styrelsen kan också inkludera upp till två (2) suppleanter.</p>
<p><strong>4.3</strong> Styrelsemedlemmar väljs vid årsmötet för en mandatperiod på ett (1) år.</p>
<p><strong>4.4</strong> Styrelsen ansvarar för föreningens verksamhet, ekonomi och administration enligt dessa stadgar och beslut som fattats av föreningsstämman.</p>
<p><strong>4.5</strong> Styrelsen ska sammanträda vid behov, men minst två gånger per år. Ytterligare möten kan sammankallas vid behov.</p>
<p><strong>4.6</strong> Styrelsen är beslutför när minst hälften av de valda ledamöterna är närvarande.</p>
<p><strong>4.7</strong> Styrelsebeslut kräver enkel majoritet. Vid lika röstetal har ordföranden utslagsröst.</p>

<h3>§5 Volontärer</h3>
<p><strong>5.1</strong> Alla volontärer ska godkännas av styrelsen.</p>
<p><strong>5.2</strong> Enskilda styrelsemedlemmar är inte behöriga att utse volontärer eller tilldela uppgifter utan styrelsens kollektiva beslut, för att säkerställa rättvisa och transparens.</p>
<p><strong>5.3</strong> Volontärer måste stödja föreningens syfte och följa dessa stadgar.</p>
<p><strong>5.4</strong> Styrelsen kan tilldela volontärer till specifika projekt, evenemang eller pågående aktiviteter efter behov.</p>
<p><strong>5.5</strong> Projektledare eller eventkoordinatorer kan utses av styrelsen för att övervaka volontäraktiviteter.</p>
<p><strong>5.6</strong> Volontärer kan få ersättning för i förväg godkända utgifter som är direkt relaterade till deras volontärarbete, förutsatt korrekt dokumentation och kvitton.</p>
<p><strong>5.7</strong> Styrelsen förbehåller sig rätten att omfördela eller avsluta volontärarrangemang med rimlig varsel om prestationsförväntningar inte uppfylls eller om stadgar bryts.</p>
<p><strong>5.8</strong> Volontärer förväntas representera föreningen professionellt under projekt och evenemang.</p>

<h3>§6 Föreningsstämmor</h3>
<p><strong>6.1</strong> Årsmötet är föreningens högsta beslutande organ.</p>
<p><strong>6.2</strong> Årsmötet ska hållas en gång per år, senast den 30 juni</p>
<p><strong>6.3</strong> Kallelse till årsmötet måste skickas till alla medlemmar minst fyra (4) veckor i förväg</p>
<p><strong>6.4</strong> Extra möten kan kallas av styrelsen eller på skriftlig begäran av minst en tredjedel av medlemmarna.</p>
<p><strong>6.5</strong> Kallelse till extra möten måste skickas minst två (2) veckor i förväg.</p>
<p><strong>6.6</strong> Alla medlemmar har lika rösträtt. Beslut kräver enkel majoritet om inte annat anges i dessa stadgar.</p>
<p><strong>6.7</strong> För giltiga beslut måste minst en tredjedel av medlemmarna vara närvarande (beslutförhet).</p>

<h3>§7 Årsmötets dagordning</h3>
<p>Årsmötet ska behandla:</p>
<ol>
  <li>Mötets öppnande</li>
  <li>Val av mötesordförande och sekreterare</li>
  <li>Godkännande av kallelse och dagordning</li>
  <li>Årsrapport från styrelsen</li>
  <li>Ekonomisk rapport</li>
  <li>Beslut om ansvarsfrihet för styrelsen</li>
  <li>Val av styrelsemedlemmar och eventuella suppleanter</li>
  <li>Val av revisor (om krävs)</li>
  <li>Budget för kommande år</li>
  <li>Medlemsavgifter och bidrag (om några)</li>
  <li>Övriga ärenden som skriftligen inlämnats till styrelsen minst två veckor före mötet</li>
  <li>Mötets avslutande</li>
</ol>

<h3>§8 Ekonomisk förvaltning</h3>
<p><strong>8.1</strong> Föreningens räkenskapsår följer kalenderåret (1 januari - 31 december).</p>
<p><strong>8.2</strong> Styrelsen förvaltar föreningens ekonomi ansvarsfullt.</p>
<p><strong>8.3</strong> Alla finansiella transaktioner ska genomföras via föreningens bankkonto.</p>

<h4>§8.4 Inkommande överföringar</h4>
<p><strong>8.4.1</strong> Alla inkommande överföringar måste godkännas genom enhälligt beslut av alla styrelsemedlemmar innan de accepteras som föreningsinkomst och måste stödjas av korrekt dokumentation och ett skriftligt förslag.</p>
<p><strong>8.4.2</strong> Styrelsemedlemmar måste underrättas om alla inkommande överföringar och ges rimlig tid för granskning och godkännande.</p>
<p><strong>8.4.3</strong> Inkommande överföringar måste överensstämma med föreningens syfte och följa tillämplig lag.</p>
<p><strong>8.4.4</strong> Styrelsens godkännande måste dokumenteras i mötesprotokoll eller skriftligt beslut.</p>

<h4>§8.5 Utgående överföringar</h4>
<p><strong>8.5.1</strong> Alla utgående överföringar, inklusive donationer och bidrag, kräver styrelsegodkännande före utbetalning och måste stödjas av korrekt dokumentation och ett skriftligt förslag.</p>
<p><strong>8.5.2</strong> Varje utgående överföring måste stödjas av korrekt dokumentation och ett skriftligt förslag som anger:</p>
<ul>
  <li>Syfte och mottagare</li>
  <li>Belopp och motivering</li>
  <li>Hur överföringen överensstämmer med föreningens uppdrag</li>
</ul>
<p><strong>8.5.3</strong> Styrelsens godkännande måste dokumenteras i mötesprotokoll eller skriftligt beslut.</p>

<h4>§8.6 Utgiftsförfarande</h4>
<p>Utgiftsanspråk, såsom transport eller tågbiljetter, måste åtföljas av giltiga underlag.</p>

<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th>Beloppintervall (SEK)</th>
      <th>Initierad av</th>
      <th>Godkännande krävs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1 - 500</td>
      <td>Ekonomiansvarig</td>
      <td>Ordförande (1)</td>
    </tr>
    <tr>
      <td>500 - 3,000</td>
      <td>Ekonomiansvarig</td>
      <td>Ordförande (1) och en styrelseledamot</td>
    </tr>
    <tr>
      <td>Över 3,000</td>
      <td>Ekonomiansvarig</td>
      <td>Hela styrelsen inklusive ordföranden</td>
    </tr>
  </tbody>
</table>

<p><strong>8.7</strong> Föreningens medel ska placeras på ett bankkonto i föreningens namn.</p>
<p><strong>8.8</strong> Årliga ekonomiska räkenskaper ska presenteras vid årsmötet.</p>
<p><strong>8.9</strong> Ekonomiansvarig, eller en person utsedd av styrelsen, ska upprätta och uppdatera månadskontoredovisningen.</p>
<p><strong>8.10</strong> Redovisningen måste vara färdigställd senast den andra dagen efter månadens slut.</p>
<p><strong>8.11</strong> Redovisningen ska presenteras för ordföranden.</p>
<p><strong>8.12</strong> Redovisningen ska göras tillgänglig för styrelsen och för medlemmar på begäran.</p>

<h3>§9 Revision</h3>
<p><strong>9.1</strong> Om föreningens årliga omsättning överstiger 3 miljoner SEK, eller om det begärs av medlemmar som representerar minst 10 % av medlemskapet, ska en revisor väljas.</p>
<p><strong>9.2</strong> Revisorns mandatperiod är ett år.</p>
<p><strong>9.3</strong> Revisorn ska granska föreningens räkenskaper och administration.</p>

<h3>§10 Ändringar av stadgarna</h3>
<p><strong>10.1</strong> Förslag till ändringar måste lämnas in skriftligen till styrelsen minst fyra (4) veckor före års- eller extramötet.</p>
<p><strong>10.2</strong> Ändringar kräver en två tredjedelars (2/3) majoritet av medlemmarna som är närvarande vid mötet.</p>
<p><strong>10.3</strong> Ändringar träder i kraft omedelbart efter antagandet om inte annat beslutas.</p>

<h3>§11 Upplösning av föreningen</h3>
<p><strong>11.1</strong> Upplösning kan endast beslutas vid två på varandra följande föreningsstämmor med minst två månader mellan dem.</p>
<p><strong>11.2</strong> Varje möte måste godkänna upplösning med en två tredjedelars (2/3) majoritet.</p>
<p><strong>11.3</strong> Vid upplösning ska föreningens tillgångar doneras till en ideell organisation med liknande mål, enligt beslut vid det slutliga mötet.</p>
<p><strong>11.4</strong> All dokumentation ska bevaras enligt tillämplig lag.</p>

<h3>§12 Konflikter och tolkning</h3>
<p><strong>12.1</strong> Tvister om tolkning av dessa stadgar ska lösas av styrelsen.</p>
<p><strong>12.2</strong> Om en medlem inte håller med om styrelsens tolkning kan ärendet tas upp på nästa föreningsstämma för slutligt beslut.</p>

<h3>§13 Lagefterlevnad</h3>
<p><strong>13.1</strong> Föreningen ska följa alla tillämpliga svenska lagar och förordningar.</p>
<p><strong>13.2</strong> Dessa stadgar kompletteras av svensk föreningslagstiftning där inte annat anges.</p>

<hr>
<p><em>Adoptionsdatum: [dd/mm/yyyy]</em><br>
<em>Adoptionsort: [Stad, Sverige]</em><br>
<em>Kontakt: contact.sahakumkhmer.se@gmail.com</em><br>
<em>Webbplats: <a href="https://www.sahakumkhmer.se">https://www.sahakumkhmer.se</a></em></p>
`

  // Khmer Translation (Basic structure - you'll need to refine this)
  const khmerContent = `
<h2>គោលបំណង</h2>
<p>សហគមខ្មែរ គឺជាសមាគមមិនរកប្រាក់ចំណេញដែលបានបង្កើតឡើងដើម្បីគាំទ្រប្រជាជនកម្ពុជាដែលរស់នៅក្នុងប្រទេសស៊ុយអែតក្នុងការធ្វើសមាហរណកម្មទៅក្នុងសង្គម។ សមាគមនេះព្យាយាមបង្កើតសហគមន៍ដែលស្វាគមន៍និងរួមបញ្ចូលដោយជួយបុគ្គលម្នាក់ៗឱ្យសម្រប់ខ្លួនទៅនឹងសង្គមស៊ុយអែត ស្វែងរកការងារដែលមានអត្ថន័យ និងរក្សាទំនាក់ទំនងដ៏រឹងមាំទៅនឹងបេតិកភណ្ឌកម្ពុជារបស់ពួកគេ។</p>

<h2>បេសកកម្ម</h2>
<p>ដើម្បីផ្តល់សិទ្ធិអំណាចដល់សហគមន៍កម្ពុជាក្នុងប្រទេសស៊ុយអែត—ជាពិសេសសស្ត្រីក្នុងអាពាហ៍ពិពាហ៍អន្តរវប្បធម៌ និងសិស្សានុសិស្ស—តាមរយៈការលើកកម្ពស់ការរួមបញ្ចូលវប្បធម៌ ការអភិវឌ្ឍន៍ផ្ទាល់ខ្លួន និងការអភិវឌ្ឍន៍អាជីព។</p>

<h2>ចក្ខុវិស័យ</h2>
<p>ដើម្បីកសាងសហគមន៍កម្ពុជាដ៏រឹងមាំ និងរួមបញ្ចូលក្នុងប្រទេសស៊ុយអែតដែលអបអរបេតិកភណ្ឌវប្បធម៌ គាំទ្រការរួមបញ្ចូល និងផ្តល់សិទ្ធិអំណាចដល់បុគ្គលឱ្យរីកចម្រើនក្នុងសង្គម និងវិជ្ជាជីវៈ។</p>

<h2>សកម្មភាពគំរូ</h2>
<ul>
  <li>ពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរ</li>
  <li>សិក្ខាសាលាធ្វើម្ហូបប្រពៃណី</li>
  <li>ការតាំងពិព័រណ៍ និងការសំដែងវប្បធម៌</li>
  <li>ការគាំទ្រភាសាស៊ុយអែត និងការបង្រៀន</li>
  <li>ការជួបជុំសហគមន៍ សិក្ខាសាលា និងព្រឹត្តិការណ៍បណ្តាញ</li>
  <li>គាំទ្រអ្នកមកថ្មី រួមទាំងការចែករំលែកបទពិសោធន៍ទាក់ទងនឹងការអប់រំ ឱកាសការងារ និងការសម្រប់ខ្លួនទៅនឹងជីវិតក្នុងប្រទេសស៊ុយអែត</li>
</ul>

<h2>ជំពូក</h2>

<h3>§១ ឈ្មោះ</h3>
<p>ឈ្មោះរបស់សមាគមគឺ <strong>សហគមខ្មែរ</strong>។</p>
<p>អាសយដ្ឋានចុះបញ្ជីរបស់សមាគមគឺ៖ <strong>Törnerosggatan 4B, 633 43 ESKILSTUNA</strong></p>

<h3>§២ គោលបំណង</h3>
<p>សហគមខ្មែរ គឺជាសមាគមមិនរកប្រាក់ចំណេញដែលបានបង្កើតឡើងដើម្បីគាំទ្រប្រជាជនកម្ពុជាដែលរស់នៅក្នុងប្រទេសស៊ុយអែតក្នុងការធ្វើសមាហរណកម្មទៅក្នុងសង្គម។</p>

<h3>§៣ សមាជិកភាព</h3>
<p><strong>៣.១</strong> សមាជិកភាពបើកចំហសម្រាប់បុគ្គលដែលមានអាយុ ១៨ ឆ្នាំ និងខាងលើដែលគាំទ្រគោលបំណង និងធម្មនុញ្ញរបស់សមាគម។</p>
<p><strong>៣.២</strong> មិនមានការទាមទារថ្លៃសមាជិកប្រចាំឆ្នាំនៅពេលនេះទេ។ ការរួមចំណែកស្ម័គ្រចិត្តអាចត្រូវបានណែនាំសម្រាប់សកម្មភាពជាក់លាក់ ដែលត្រូវការការអនុម័តពីក្រុមប្រឹក្សា។</p>
<p><strong>៣.៣</strong> ពាក្យសុំសមាជិកភាពត្រូវតែដាក់ស្នើតាមរយៈទម្រង់ពាក្យសុំតាមអ៊ីនធឺណិតផ្លូវការរបស់សមាគមនៅ https://www.sahakumkhmer.se/en/join ហើយត្រូវបានអនុម័តដោយការសម្រេចចិត្តតាមច្បាប់ភាគច្រើនរបស់ក្រុមប្រឹក្សា។</p>

<h3>§៤ ក្រុមប្រឹក្សា</h3>
<p><strong>៤.១</strong> ក្រុមប្រឹក្សាត្រូវមានសមាជិកយ៉ាងហោចណាស់បី (៣) នាក់៖ ប្រធានមួយនាក់ និងសមាជិកយ៉ាងហោចណាស់ពីរ (២) នាក់ទៀត។</p>
<p><strong>៤.២</strong> ក្រុមប្រឹក្សាក៏អាចរួមបញ្ចូលសមាជិករង រហូតដល់ពីរ (២) នាក់។</p>

<h3>§៨ ការគ្រប់គ្រងហិរញ្ញវត្ថុ</h3>
<p><strong>៨.១</strong> ឆ្នាំហិរញ្ញវត្ថុរបស់សមាគមធ្វើតាមឆ្នាំប្រតិទិន (១ មករា - ៣១ ធ្នូ)។</p>
<p><strong>៨.២</strong> ក្រុមប្រឹក្សាគ្រប់គ្រងហិរញ្ញវត្ថុរបស់សមាគមដោយទំនួលខុសត្រូវ។</p>

<h4>តារាងការអនុម័តការចំណាយ</h4>
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th>ចំនួនទឹកប្រាក់ (SEK)</th>
      <th>ផ្តួចផ្តើមដោយ</th>
      <th>ការអនុម័តតំរូវការ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>១ - ៥០០</td>
      <td>មន្ត្រីហិរញ្ញវត្ថុ</td>
      <td>ប្រធាន (១)</td>
    </tr>
    <tr>
      <td>៥០០ - ៣,០០០</td>
      <td>មន្ត្រីហិរញ្ញវត្ថុ</td>
      <td>ប្រធាន (១) និងសមាជិកក្រុមប្រឹក្សាម្នាក់</td>
    </tr>
    <tr>
      <td>លើសពី ៣,០០០</td>
      <td>មន្ត្រីហិរញ្ញវត្ថុ</td>
      <td>ក្រុមប្រឹក្សាទាំងមូល រួមទាំងប្រធាន</td>
    </tr>
  </tbody>
</table>

<hr>
<p><em>កាលបរិច្ឆេទអនុម័ត: [ថ្ងៃ/ខែ/ឆ្នាំ]</em><br>
<em>ទីកន្លែងអនុម័ត: [ទីក្រុង, ស៊ុយអែត]</em><br>
<em>ទំនាក់ទំនង: contact.sahakumkhmer.se@gmail.com</em><br>
<em>គេហទំព័រ: <a href="https://www.sahakumkhmer.se">https://www.sahakumkhmer.se</a></em></p>
`

  console.log('Creating statute page with all translations...')

  // Create ONE page with all three language translations
  const statutePage = await prisma.contentItem.create({
    data: {
      slug: 'statutes',
      type: 'PAGE',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Association Statutes',
            content: englishContent,
            excerpt: 'Official statutes of Sahakum Khmer - Non-profit Association for Cambodians in Sweden'
          },
          {
            language: 'sv',
            title: 'Föreningens Stadgar',
            content: swedishContent,
            excerpt: 'Officiella stadgar för Sahakum Khmer - Ideell förening för kambodjaner i Sverige'
          },
          {
            language: 'km',
            title: 'ជំពូកសមាគម',
            content: khmerContent,
            excerpt: 'ជំពូកផ្លូវការរបស់សហគមខ្មែរ - សមាគមមិនរកប្រាក់ចំណេញសម្រាប់ជនជាតិកម្ពុជាក្នុងប្រទេសស៊ុយអែត'
          }
        ]
      }
    }
  })

  console.log('✅ Created statutes page with all translations')

  console.log('\n📄 Statute Page Created:')
  console.log(`   Page ID: ${statutePage.id}`)
  console.log(`   Slug: statutes`)
  console.log(`   English: /en/statutes`)
  console.log(`   Swedish: /sv/statutes`)
  console.log(`   Khmer:   /km/statutes`)
  console.log('\n💡 Tip: You can now edit this page in the admin panel at /admin/pages')
  console.log('   and refine the Khmer translation as needed.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding statute pages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
