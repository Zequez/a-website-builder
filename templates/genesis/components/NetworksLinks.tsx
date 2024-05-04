import InstagramIcon from '~icons/fa6-brands/instagram';
import FacebookIcon from '~icons/fa6-brands/facebook';
import WhatsappIcon from '~icons/fa6-brands/whatsapp';
import TelegramIcon from '~icons/fa6-brands/telegram';

export default function NetworksLinks() {
  return (
    <div class="absolute w-full left-0 bottom-0 flexcc bg-black/50 space-x-4 px-4 flex-wrap py2">
      <a class="flexcc">
        <InstagramIcon class="mr-2" /> ezequiel.inventos
      </a>
      <a class="flexcc">
        <FacebookIcon class="mr-2" /> Ezequiel
      </a>
      <a class="flexcc">
        <WhatsappIcon class="mr-2 " /> 2235235568 <TelegramIcon class="ml-2" />
      </a>
    </div>
  );
}
